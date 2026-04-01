'use client';

import { useState, useRef, useCallback } from 'react';

// ── SVG Icons ──────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const BrainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
const ALLOWED_EXTS = ['.pdf', '.docx', '.doc'];

function getExt(name) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

function isValidFile(file) {
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(getExt(file.name));
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ── Main Component ─────────────────────────────────────────────
export default function Home() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const inputRef = useRef(null);

  const handleFileSelect = useCallback((selected) => {
    if (!selected) return;
    if (!isValidFile(selected)) {
      setInlineError('Invalid file type. Please upload a PDF or Word document (.pdf, .docx, .doc).');
      setFile(null);
      return;
    }
    setInlineError('');
    setFile(selected);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleZoneClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('loading');
    setResult(null);
    setShowPreview(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed. Please try again.');
      }

      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setFile(null);
    setResult(null);
    setInlineError('');
    setErrorMessage('');
    setShowPreview(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-icon">
            <BrainIcon />
          </div>
          <span className="logo-text">Doc<span>Mind</span></span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <BrainIcon />
            AI-Powered Analysis
          </div>
          <h1>Understand any document <em>instantly</em></h1>
          <p className="hero-sub">
            Upload a PDF or Word file and get a structured analysis — summary, key points, sections, and more — powered by Claude AI.
          </p>
        </div>
      </section>

      {/* ── Main ── */}
      <main className="main">
        <div className="card">

          {/* ── Idle / Upload State ── */}
          {status === 'idle' && (
            <div className="upload-form">
              <div
                className={`upload-zone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
                onClick={handleZoneClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick()}
                aria-label="Upload document"
              >
                <div className="upload-icon">
                  <UploadIcon />
                </div>
                <p className="upload-title">
                  {file ? 'File selected' : 'Drop your document here'}
                </p>
                <p className="upload-sub">
                  {file ? 'Ready to analyze' : 'or click to browse'}
                </p>
                {file ? (
                  <div className="file-selected">
                    <FileIcon />
                    <span className="file-selected-name">{file.name}</span>
                    <span className="file-selected-size">{formatBytes(file.size)}</span>
                  </div>
                ) : (
                  <p className="upload-types">PDF · DOCX · DOC</p>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  style={{ display: 'none' }}
                  onChange={handleInputChange}
                />
              </div>

              {inlineError && (
                <div className="inline-error">
                  <AlertIcon />
                  {inlineError}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!file}
              >
                <BrainIcon />
                Analyze Document
              </button>
            </div>
          )}

          {/* ── Loading State ── */}
          {status === 'loading' && (
            <div className="loading-state">
              <div className="spinner" />
              <p className="loading-label">Analyzing document…</p>
              <p className="loading-sub">Claude is reading and understanding your file</p>
            </div>
          )}

          {/* ── Error State ── */}
          {status === 'error' && (
            <div className="error-state">
              <div className="error-icon">
                <AlertIcon />
              </div>
              <p className="error-title">Analysis failed</p>
              <p className="error-message">{errorMessage}</p>
              <div className="error-actions">
                <button className="btn-secondary" onClick={handleReset}>
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* ── Success / Results State ── */}
          {status === 'success' && result && (
            <>
              {/* Results Header */}
              <div className="results-header">
                <div className="results-header-inner">
                  <div className="results-header-top">
                    <h2 className="results-doc-title">{result.analysis.title}</h2>
                    <button className="btn-secondary" onClick={handleReset} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.25)', color: 'white' }}>
                      New file
                    </button>
                  </div>
                  <div className="results-chips">
                    <span className="chip"><span className="chip-dot" />{result.fileType}</span>
                    <span className="chip"><span className="chip-dot" />{result.analysis.documentType}</span>
                    {result.analysis.author && result.analysis.author !== 'Not specified' && (
                      <span className="chip"><span className="chip-dot" />{result.analysis.author}</span>
                    )}
                    <span className="chip"><span className="chip-dot" />{result.analysis.wordCount?.toLocaleString()} words</span>
                    <span className="chip"><span className="chip-dot" />{result.analysis.language}</span>
                  </div>
                </div>
              </div>

              {/* Results Body */}
              <div className="results-body">

                {/* Summary */}
                <div className="section-block">
                  <div className="section-block-header">Summary</div>
                  <div className="section-block-body">{result.analysis.summary}</div>
                </div>

                {/* Key Points */}
                {result.analysis.keyPoints?.length > 0 && (
                  <div className="section-block">
                    <div className="section-block-header">Key Points</div>
                    <div className="section-block-body">
                      <ul className="key-points-list">
                        {result.analysis.keyPoints.map((point, i) => (
                          <li key={i} className="key-point">
                            <span className="key-point-dot" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Document Sections */}
                {result.analysis.keySections?.length > 0 && (
                  <div className="section-block">
                    <div className="section-block-header">Document Sections</div>
                    <div className="sections-grid">
                      {result.analysis.keySections.map((sec, i) => (
                        <div key={i} className="section-card">
                          <p className="section-card-heading">{sec.heading}</p>
                          <p className="section-card-desc">{sec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Text Preview */}
                {result.extractedText && (
                  <div>
                    <button
                      className={`text-preview-toggle${showPreview ? ' open' : ''}`}
                      onClick={() => setShowPreview((v) => !v)}
                    >
                      <ChevronIcon />
                      {showPreview ? 'Hide' : 'Show'} extracted text
                    </button>
                    {showPreview && (
                      <pre className="text-preview">{result.extractedText}</pre>
                    )}
                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </main>
    </>
  );
}
