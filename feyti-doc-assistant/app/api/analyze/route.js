import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];

function getFileExtension(filename) {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

async function extractTextFromPDF(buffer) {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDOCX(buffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const filename = file.name || '';
    const mimeType = file.type || '';
    const ext = getFileExtension(filename);

    const isValidMime = ALLOWED_MIME_TYPES.includes(mimeType);
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidMime && !isValidExt) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or Word document.' },
        { status: 422 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';
    let fileType = '';

    if (ext === '.pdf' || mimeType === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
      fileType = 'PDF';
    } else {
      extractedText = await extractTextFromDOCX(buffer);
      fileType = ext === '.doc' ? 'DOC' : 'DOCX';
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Could not extract readable text. The file may be scanned or image-based.' },
        { status: 422 }
      );
    }

    const cappedText = extractedText.slice(0, 12000);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze the following document text and return ONLY a raw JSON object — no markdown fences, no backticks, no explanation, just the JSON.

The JSON must match this exact shape:
{
  "title": "string — inferred document title",
  "author": "string — author name or 'Not specified'",
  "documentType": "string — e.g. Report, Contract, Research Paper, Article, Manual",
  "summary": "string — 3 to 5 sentence summary",
  "keySections": [{ "heading": "string", "description": "string" }],
  "keyPoints": ["string — up to 6 key points"],
  "wordCount": integer,
  "language": "string — e.g. English, French"
}

Document text:
${cappedText}`,
        },
      ],
    });

    let rawContent = message.content[0].text.trim();

    // Strip accidental ```json fences
    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const analysis = JSON.parse(rawContent);

    return NextResponse.json({
      success: true,
      filename,
      fileType,
      analysis,
      extractedText: extractedText.slice(0, 3000),
    });
  } catch (err) {
    console.error('Analyze error:', err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'AI returned an unexpected response format. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
