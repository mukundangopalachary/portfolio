import { useState, useEffect, useRef, useCallback } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

interface Props {
  src: string;
  title: string;
  fileName?: string;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200, 300] as const;
const MAX_DPR = 2;

// ── PdfPage: renders a single page lazily via IntersectionObserver ──────────

interface PageProps {
  pdfDoc: PDFDocumentProxy;
  pageNum: number;
  scale: number | 'fit';
  containerWidth: number;
}

function PdfPage({ pdfDoc, pageNum, scale, containerWidth }: PageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const renderedScaleRef = useRef<number | null>(null);

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || containerWidth <= 0) return;

    let page: PDFPageProxy;
    try {
      page = await pdfDoc.getPage(pageNum);
    } catch {
      return;
    }

    const baseViewport = page.getViewport({ scale: 1 });
    const resolvedScale =
      scale === 'fit' ? containerWidth / baseViewport.width : scale / 100;

    // skip if already rendered at same scale
    if (renderedScaleRef.current === resolvedScale) return;

    // cancel any in-flight render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const viewport = page.getViewport({ scale: resolvedScale });

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;

    try {
      await task.promise;
      renderedScaleRef.current = resolvedScale;
    } catch (err: unknown) {
      // RenderingCancelledException is expected when we cancel
      if (err instanceof Error && err.name !== 'RenderingCancelledException') {
        console.error('PDF render error:', err);
      }
    } finally {
      renderTaskRef.current = null;
    }
  }, [pdfDoc, pageNum, scale, containerWidth]);

  const clearCanvas = useCallback(() => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
    renderedScaleRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          renderPage();
        } else {
          // clear pages far off-screen (margin ensures we only clear when truly gone)
          clearCanvas();
        }
      },
      { rootMargin: '200px 0px 200px 0px', threshold: 0 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [renderPage, clearCanvas]);

  // re-render when scale or containerWidth changes
  useEffect(() => {
    renderedScaleRef.current = null; // force re-render
    renderPage();
  }, [scale, containerWidth, renderPage]);

  return (
    <div
      className="flex justify-center"
      style={{ padding: '0.5rem 0' }}
    >
      {/* canvas dimensions are set by JS — that is the one acceptable inline-style exception */}
      <canvas
        ref={canvasRef}
        aria-label={`Page ${pageNum}`}
        style={{ display: 'block', maxWidth: '100%' }}
      />
    </div>
  );
}

// ── PdfViewer ───────────────────────────────────────────────────────────────

export default function PdfViewer({ src, title, fileName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState<number | 'fit'>('fit');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  const downloadName = fileName ?? src.split('/').pop() ?? 'report.pdf';

  // ── compute container width ──────────────────────────────────────────────
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 32); // subtract padding
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [open]);

  // ── open / close ─────────────────────────────────────────────────────────
  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    setError(false);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const { GlobalWorkerOptions } = pdfjsLib;
      // dynamic import of worker url
      const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      const workerUrl: string = workerModule.default;
      GlobalWorkerOptions.workerSrc = workerUrl;
      const doc = await pdfjsLib.getDocument(src).promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
    } catch (err) {
      console.error('PDF load error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    pdfDoc?.destroy();
    setPdfDoc(null);
    setNumPages(0);
    setScale('fit');
    setOpen(false);
    setError(false);
    // return focus to trigger button
    setTimeout(() => triggerRef.current?.focus(), 0);
  }

  // ── focus trap ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => firstFocusRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ── keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { handleClose(); return; }
      if (e.ctrlKey) {
        if (e.key === '+' || e.key === '=' || e.key === 'Add') { e.preventDefault(); zoomIn(); return; }
        if (e.key === '-' || e.key === 'Subtract') { e.preventDefault(); zoomOut(); return; }
        if (e.key === '0') { e.preventDefault(); setScale('fit'); return; }
      }
      if (e.key === '+' || e.key === '=') { zoomIn(); return; }
      if (e.key === '-') { zoomOut(); return; }
      if (e.key === '0') { setScale('fit'); return; }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── zoom helpers ─────────────────────────────────────────────────────────
  function currentZoomIndex(): number {
    if (scale === 'fit') return -1;
    return ZOOM_LEVELS.indexOf(scale as typeof ZOOM_LEVELS[number]);
  }

  function zoomIn() {
    const idx = currentZoomIndex();
    if (idx === -1) {
      setScale(ZOOM_LEVELS[3]); // 125%
    } else if (idx < ZOOM_LEVELS.length - 1) {
      setScale(ZOOM_LEVELS[idx + 1]);
    }
  }

  function zoomOut() {
    const idx = currentZoomIndex();
    if (idx === -1) {
      setScale(ZOOM_LEVELS[2]); // 100%
    } else if (idx > 0) {
      setScale(ZOOM_LEVELS[idx - 1]);
    }
  }

  function zoomLabel(): string {
    if (scale === 'fit') return 'Fit';
    return `${scale}%`;
  }

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        View report
      </button>

      {/* Dialog overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center sm:p-6 backdrop-blur-md bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="flex flex-col w-full h-full sm:max-h-[90vh] sm:max-w-4xl sm:rounded-xl overflow-hidden bg-[var(--color-bg)] sm:border sm:border-[var(--color-border)] sm:shadow-2xl"
        >
          {/* Toolbar */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
            style={{ minHeight: '48px' }}
          >
            {/* Title */}
            <span className="text-sm font-medium text-[var(--color-text)] truncate min-w-0 mr-2">
              {title}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Zoom out */}
              <button
                onClick={zoomOut}
                aria-label="Zoom out"
                className="flex items-center justify-center w-11 h-11 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] font-mono text-base"
              >
                −
              </button>

              {/* Zoom label */}
              <span
                aria-live="polite"
                aria-label={`Zoom level: ${zoomLabel()}`}
                className="w-14 text-center text-xs font-mono text-[var(--color-text-muted)] select-none"
              >
                {zoomLabel()}
              </span>

              {/* Zoom in */}
              <button
                onClick={zoomIn}
                aria-label="Zoom in"
                className="flex items-center justify-center w-11 h-11 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] font-mono text-base"
              >
                +
              </button>

              {/* Fit width */}
              <button
                onClick={() => setScale('fit')}
                aria-label="Fit to width"
                className="flex items-center justify-center h-11 px-3 rounded text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                Fit
              </button>

              {/* Download */}
              <a
                href={src}
                download={downloadName}
                aria-label="Download PDF"
                className="flex items-center justify-center w-11 h-11 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] text-base"
              >
                ⤓
              </a>

              {/* Close */}
              <button
                ref={firstFocusRef}
                onClick={handleClose}
                aria-label="Close PDF viewer"
                className="flex items-center justify-center w-11 h-11 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 py-4"
            style={{ overscrollBehavior: 'contain' }}
          >
            {loading && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <span className="text-sm text-[var(--color-text-muted)]">Loading…</span>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Couldn't load the preview.
                </p>
                <a
                  href={src}
                  download={downloadName}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                >
                  Download PDF
                </a>
              </div>
            )}

            {!loading && !error && pdfDoc && containerWidth > 0 && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                  <PdfPage
                    key={pageNum}
                    pdfDoc={pdfDoc}
                    pageNum={pageNum}
                    scale={scale}
                    containerWidth={containerWidth}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Page count footer */}
          {!loading && !error && numPages > 0 && (
            <div
              className="text-center py-2 text-xs font-mono text-[var(--color-text-muted)] border-t border-[var(--color-border)] bg-[var(--color-surface)]"
              aria-live="polite"
            >
              {numPages} {numPages === 1 ? 'page' : 'pages'}
            </div>
          )}
        </div>
        </div>
      )}
    </>
  );
}
