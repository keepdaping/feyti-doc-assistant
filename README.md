# DocMind – AI Document Assistant

> Upload any PDF or Word document and get an instant AI-powered analysis.

**Live demo:** https://your-deployment-url.vercel.app *(replace after deploying)*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes |
| AI / LLM | Anthropic Claude (`claude-sonnet-4-20250514`) |
| PDF parsing | pdf-parse |
| DOCX parsing | mammoth |
| Deployment | Vercel |
| CI / CD | GitHub Actions |

---

## How It Works

1. **Upload** — User drags and drops (or clicks to browse) a PDF or Word file.
2. **Validate** — The API route checks the file type by MIME type and extension.
3. **Extract** — Text is extracted from the file using `pdf-parse` (PDF) or `mammoth` (DOCX/DOC).
4. **Analyze** — The extracted text (capped at 12,000 characters) is sent to Claude with a structured prompt requesting a JSON analysis.
5. **Display** — The UI renders the title, summary, key points, document sections, metadata chips, and a collapsible raw text preview.

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/feyti-doc-assistant.git
cd feyti-doc-assistant

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and add your Anthropic API key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Vercel Deployment

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Click **Deploy**.

---

## GitHub Actions Secrets

Add the following secrets to your GitHub repository (**Settings → Secrets and variables → Actions**):

| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (used during build) |
| `VERCEL_TOKEN` | Your Vercel personal access token |
| `VERCEL_ORG_ID` | Your Vercel team / org ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |

---

## Project Structure

```
feyti-doc-assistant/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js        # POST handler: validate → extract → analyze
│   ├── globals.css             # Design system & component styles
│   ├── layout.js               # Root layout with Google Fonts metadata
│   └── page.js                 # Client component: upload, loading, results views
├── .github/
│   └── workflows/
│       └── ci.yml              # Lint + build + Vercel deploy pipeline
├── .env.example                # Environment variable template
├── .gitignore
├── next.config.mjs             # serverExternalPackages for pdf-parse & mammoth
├── package.json
└── README.md
```

---

## Error Handling

| Scenario | HTTP Status | User Message |
|---|---|---|
| No file attached | 400 | "No file provided." |
| Wrong file type | 422 | "Invalid file type. Please upload a PDF or Word document." |
| Scanned / image-only file | 422 | "Could not extract readable text. The file may be scanned or image-based." |
| Claude returns malformed JSON | 500 | "AI returned an unexpected response format. Please try again." |
| Any other server error | 500 | Error message from the exception |

---

## Why Claude?

`claude-sonnet-4-20250514` was chosen for its:

- **Instruction-following accuracy** — reliably returns raw JSON without markdown fences when instructed to do so.
- **Long-context capability** — handles up to 12,000 characters of extracted document text in a single prompt.
- **Structured output quality** — produces rich, coherent summaries, key points, and section descriptions in a single pass.
- **Speed / cost balance** — Sonnet provides near-Opus quality at lower latency and cost, ideal for interactive document analysis.
