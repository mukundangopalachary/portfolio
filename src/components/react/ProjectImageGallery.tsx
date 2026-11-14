import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  images: string[];
  title: string;
}

export default function ProjectImageGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const prev = useCallback(() =>
    setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);

  const next = useCallback(() =>
    setActiveIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i)), [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    // Focus the close button when lightbox opens
    closeButtonRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [activeIndex, close, next, prev]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Thumbnail grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }}
      >
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActiveIndex(i)}
            aria-label={`View ${title} screenshot ${i + 1} fullscreen`}
            style={{
              padding: 0,
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'zoom-in',
              background: 'var(--color-surface)',
              display: 'block',
              width: '100%',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            <img
              src={src}
              alt={`${title} screenshot ${i + 1}`}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                aspectRatio: '16/9',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — screenshot ${activeIndex + 1} of ${images.length}`}
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          {/* Image — stop click from bubbling to overlay */}
          <img
            src={images[activeIndex]}
            alt={`${title} screenshot ${activeIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              display: 'block',
            }}
          />

          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close image"
            style={{
              position: 'fixed',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: '#fff',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
              transition: 'background 0.15s',
              zIndex: 201,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.16)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            ✕
          </button>

          {/* Prev button */}
          {activeIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              style={{
                position: 'fixed',
                left: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#fff',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background 0.15s',
                zIndex: 201,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.16)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              ←
            </button>
          )}

          {/* Next button */}
          {activeIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              style={{
                position: 'fixed',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#fff',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background 0.15s',
                zIndex: 201,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.16)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              →
            </button>
          )}

          {/* Counter */}
          <div
            style={{
              position: 'fixed',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              zIndex: 201,
            }}
            aria-live="polite"
          >
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
