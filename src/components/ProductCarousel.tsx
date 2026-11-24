import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface ProductCarouselProps {
  images: string[];
  alt: string;
  onImageClick?: () => void;
  className?: string;
  resetKey?: string;
}

export function ProductCarousel({
  images,
  alt,
  onImageClick,
  className = '',
  resetKey,
}: ProductCarouselProps) {
  const validImages = images.filter((u) => Boolean(u && u.trim()));
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const didSwipeRef = useRef(false);

  useEffect(() => {
    setActiveIndex(0);
    setDragOffset(0);
  }, [resetKey]);

  useEffect(() => {
    if (activeIndex >= validImages.length && validImages.length > 0) {
      setActiveIndex(validImages.length - 1);
    }
  }, [activeIndex, validImages.length]);

  const total = validImages.length;

  const goTo = (nextIdx: number) => {
    if (total <= 1) return;
    const wrapped = ((nextIdx % total) + total) % total;
    setActiveIndex(wrapped);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    goTo(activeIndex - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    goTo(activeIndex + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (total <= 1) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    isHorizontalSwipeRef.current = null;
    didSwipeRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (total <= 1 || touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartXRef.current;
    const dy = touch.clientY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontalSwipeRef.current) {
      didSwipeRef.current = true;
      setDragOffset(dx);
    }
  };

  const handleTouchEnd = () => {
    if (total <= 1 || touchStartXRef.current === null) {
      setDragOffset(0);
      return;
    }
    if (isHorizontalSwipeRef.current && Math.abs(dragOffset) >= 35) {
      if (dragOffset < 0) {
        goTo(activeIndex + 1);
      } else {
        goTo(activeIndex - 1);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
    setDragOffset(0);
  };

  const handleContainerClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    onImageClick?.();
  };

  if (total === 0) {
    return (
      <div
        onClick={onImageClick}
        className={`relative aspect-square w-full overflow-hidden bg-[#FFF8E7] ${
          onImageClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        <ProductImage src="" alt={alt} className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-square w-full overflow-hidden bg-white select-none ${
        onImageClick ? 'cursor-pointer' : ''
      } ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleContainerClick}
      role={onImageClick ? 'button' : undefined}
      tabIndex={onImageClick ? 0 : undefined}
      onKeyDown={
        onImageClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onImageClick();
              }
            }
          : undefined
      }
      aria-label={onImageClick ? `Ver detalles de ${alt}` : alt}
    >
      <div
        className="flex w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(calc(-${activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
          transitionDuration: dragOffset !== 0 ? '0ms' : '300ms',
        }}
      >
        {validImages.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="w-full h-full shrink-0 flex items-center justify-center bg-white p-1.5"
          >
            <ProductImage
              src={src}
              alt={`${alt}${total > 1 ? ` — fotografía ${idx + 1} de ${total}` : ''}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Fotografía anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#10245A]/75 hover:bg-[#10245A] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Siguiente fotografía"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#10245A]/75 hover:bg-[#10245A] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#10245A]/65 backdrop-blur-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {validImages.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                  }}
                  aria-label={`Ir a fotografía ${idx + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'w-5 h-2 bg-[#FFD500]'
                      : 'w-2 h-2 bg-white/75 hover:bg-white'
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
