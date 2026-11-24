import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Share2,
  Copy,
  Check,
  Archive,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  Product,
  PublicSettings,
  SLIDE_DEFINITIONS,
  SlideTextOverrides,
} from '../types';
import {
  buildDefaultSlideOverrides,
  exportAllSlidesZip,
  renderSlideToDataUrl,
} from '../utils/slideRenderer';
import { generateSocialCopy } from '../utils/whatsapp';

interface SlideGeneratorProps {
  products: Product[];
  settings: PublicSettings;
  initialProductId?: string;
}

export function SlideGenerator({
  products,
  settings,
  initialProductId,
}: SlideGeneratorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || products[0]?.id || ''
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(1);
  const [overridesMap, setOverridesMap] = useState<
    Record<string, Record<number, SlideTextOverrides>>
  >({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [rendering, setRendering] = useState<boolean>(false);
  const [zipping, setZipping] = useState<boolean>(false);
  const [socialTab, setSocialTab] = useState<'whatsapp' | 'facebook' | 'tiktok'>('whatsapp');
  const [copiedSocial, setCopiedSocial] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0] || null,
    [products, selectedProductId]
  );

  useEffect(() => {
    if (initialProductId && products.some((p) => p.id === initialProductId)) {
      setSelectedProductId(initialProductId);
    }
  }, [initialProductId, products]);

  const currentProductOverrides = useMemo(() => {
    if (!selectedProduct) return {};
    return (
      overridesMap[selectedProduct.id] ||
      buildDefaultSlideOverrides(selectedProduct, settings)
    );
  }, [selectedProduct, overridesMap, settings]);

  const currentSlideOverride: SlideTextOverrides = useMemo(() => {
    return (
      currentProductOverrides[activeSlideIndex] || {
        headline: '',
        bodyLines: [],
        footerNote: '',
      }
    );
  }, [currentProductOverrides, activeSlideIndex]);

  useEffect(() => {
    if (!selectedProduct) return;
    let cancelled = false;
    setRendering(true);

    const timer = setTimeout(() => {
      renderSlideToDataUrl(
        activeSlideIndex,
        selectedProduct,
        settings,
        currentSlideOverride
      )
        .then((url) => {
          if (!cancelled) {
            setPreviewUrl(url);
          }
        })
        .catch(() => {
          if (!cancelled) setPreviewUrl('');
        })
        .finally(() => {
          if (!cancelled) setRendering(false);
        });
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeSlideIndex, selectedProduct, settings, currentSlideOverride]);

  const updateCurrentSlide = (patch: Partial<SlideTextOverrides>) => {
    if (!selectedProduct) return;
    setOverridesMap((prev) => {
      const base =
        prev[selectedProduct.id] ||
        buildDefaultSlideOverrides(selectedProduct, settings);
      return {
        ...prev,
        [selectedProduct.id]: {
          ...base,
          [activeSlideIndex]: {
            ...base[activeSlideIndex],
            ...patch,
          },
        },
      };
    });
  };

  const handleResetSlideTexts = () => {
    if (!selectedProduct) return;
    setOverridesMap((prev) => ({
      ...prev,
      [selectedProduct.id]: buildDefaultSlideOverrides(selectedProduct, settings),
    }));
    setStatusMessage('Textos restaurados desde los datos del producto.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleDownloadSingle = async () => {
    if (!selectedProduct) return;
    const url = await renderSlideToDataUrl(
      activeSlideIndex,
      selectedProduct,
      settings,
      currentSlideOverride
    );
    const def = SLIDE_DEFINITIONS.find((s) => s.index === activeSlideIndex);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lamina-0${activeSlideIndex}-${def?.key || 'belen'}.png`;
    a.click();
  };

  const handleDownloadAllZip = async () => {
    if (!selectedProduct) return;
    setZipping(true);
    try {
      const blob = await exportAllSlidesZip(
        selectedProduct,
        settings,
        currentProductOverrides
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `9-laminas-${selectedProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Paquete ZIP con las 9 láminas (1080 × 1920) descargado.');
    } catch {
      setStatusMessage('No se pudo generar el archivo ZIP.');
    } finally {
      setZipping(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleShareSlide = async () => {
    if (!selectedProduct || !previewUrl) return;
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const file = new File(
        [blob],
        `belen-lamina-0${activeSlideIndex}.png`,
        { type: 'image/png' }
      );
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${selectedProduct.name} — ${settings.brandName}`,
          text: `${selectedProduct.name} · ${settings.slogan}`,
          files: [file],
        });
        return;
      }
    } catch {
      // Fallback to download
    }
    await handleDownloadSingle();
  };

  const socialCopies = useMemo(() => {
    if (!selectedProduct) return { whatsapp: '', facebook: '', tiktok: '' };
    return generateSocialCopy(selectedProduct, settings);
  }, [selectedProduct, settings]);

  const handleCopySocial = async () => {
    const text = socialCopies[socialTab];
    await navigator.clipboard.writeText(text);
    setCopiedSocial(true);
    setTimeout(() => setCopiedSocial(false), 1800);
  };

  if (!selectedProduct) {
    return (
      <div className="p-8 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/10 text-center">
        <p className="font-display font-bold text-lg text-[#10245A]">
          Agrega al menos un producto para generar sus 9 láminas comerciales.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de producto y acciones globales */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/12 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <label
            htmlFor="slide-product-select"
            className="text-xs font-bold text-[#10245A]/70 block"
          >
            Producto seleccionado para generar las 9 láminas (9:16 · 1080 × 1920 px)
          </label>
          <select
            id="slide-product-select"
            value={selectedProduct.id}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 bg-white text-sm font-bold text-[#10245A]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.unitPrice ? `(Bs. ${p.unitPrice.toFixed(2)})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetSlideTexts}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-[#FFD500]/25 text-[#10245A] border border-[#10245A]/15 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sincronizar datos</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={zipping}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E6007E] hover:bg-[#c5006c] disabled:opacity-60 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>{zipping ? 'Generando ZIP...' : 'Descargar 9 láminas (ZIP)'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className="text-xs sm:text-sm font-bold text-[#00A83B] bg-[#00A83B]/10 px-4 py-2.5 rounded-xl">
          {statusMessage}
        </p>
      )}

      {/* Selector numérico de las 9 láminas */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
        {SLIDE_DEFINITIONS.map((slide) => {
          const isActive = slide.index === activeSlideIndex;
          return (
            <button
              key={slide.index}
              type="button"
              onClick={() => setActiveSlideIndex(slide.index)}
              className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center border ${
                isActive
                  ? 'bg-[#10245A] text-white border-[#10245A]'
                  : 'bg-white text-[#10245A] border-[#10245A]/15 hover:bg-[#FFF8E7]'
              }`}
            >
              <span className="tabular-nums">Lámina {slide.index}</span>
            </button>
          );
        })}
      </div>

      {/* Vista previa 9:16 + Editor de textos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Vista previa 9:16 */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveSlideIndex((i) => (i > 1 ? i - 1 : 9))}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#FFF8E7] text-[#10245A] text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <span className="text-xs font-bold text-[#10245A]/70 tabular-nums">
              Vista previa 9:16 ({activeSlideIndex}/9)
            </span>
            <button
              type="button"
              onClick={() => setActiveSlideIndex((i) => (i < 9 ? i + 1 : 1))}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#FFF8E7] text-[#10245A] text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="aspect-[9/16] w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden border border-[#10245A]/20 bg-[#FFF8E7] shadow-sm relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Vista previa Lámina ${activeSlideIndex}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-[#10245A]/60">
                Renderizando lámina...
              </div>
            )}
            {rendering && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#10245A]/80 text-white text-[11px] font-semibold">
                Actualizando...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-w-[340px] mx-auto">
            <button
              type="button"
              onClick={handleDownloadSingle}
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>PNG 1080×1920</span>
            </button>
            <button
              type="button"
              onClick={handleShareSlide}
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#1746D2] hover:bg-[#10245A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Compartir</span>
            </button>
          </div>
        </div>

        {/* Editor de textos + Contenido para redes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-[#10245A]/12 space-y-4">
            <div>
              <p className="text-xs font-bold text-[#E6007E]">
                {SLIDE_DEFINITIONS[activeSlideIndex - 1]?.subtitle}
              </p>
              <h3 className="font-display font-bold text-lg text-[#10245A]">
                {SLIDE_DEFINITIONS[activeSlideIndex - 1]?.title}
              </h3>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="slide-headline"
                className="text-xs font-bold text-[#10245A]/75 block"
              >
                Titular de la lámina
              </label>
              <input
                id="slide-headline"
                type="text"
                value={currentSlideOverride.headline}
                onChange={(e) => updateCurrentSlide({ headline: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 text-sm text-[#10245A]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="slide-body"
                className="text-xs font-bold text-[#10245A]/75 block"
              >
                Líneas de contenido (una por renglón; revisa antes de exportar)
              </label>
              <textarea
                id="slide-body"
                rows={6}
                value={currentSlideOverride.bodyLines.join('\n')}
                onChange={(e) =>
                  updateCurrentSlide({
                    bodyLines: e.target.value.split('\n'),
                  })
                }
                className="w-full p-3.5 rounded-xl border border-[#10245A]/20 text-sm text-[#10245A] leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="slide-footer"
                className="text-xs font-bold text-[#10245A]/75 block"
              >
                Nota al pie de la lámina
              </label>
              <input
                id="slide-footer"
                type="text"
                value={currentSlideOverride.footerNote}
                onChange={(e) => updateCurrentSlide({ footerNote: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 text-sm text-[#10245A]"
              />
            </div>
          </div>

          {/* Contenido listo para WhatsApp, Facebook y TikTok */}
          <div className="p-5 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/12 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-bold text-base text-[#10245A]">
                Texto preparado para publicar
              </h3>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#10245A]/10">
                {(['whatsapp', 'facebook', 'tiktok'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setSocialTab(net)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                      socialTab === net
                        ? 'bg-[#10245A] text-white'
                        : 'text-[#10245A]/70 hover:text-[#10245A]'
                    }`}
                  >
                    {net === 'whatsapp'
                      ? 'WhatsApp'
                      : net === 'facebook'
                      ? 'Facebook'
                      : 'TikTok'}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              readOnly
              rows={6}
              value={socialCopies[socialTab]}
              aria-label="Texto preparado para redes sociales"
              className="w-full p-3.5 rounded-xl border border-[#10245A]/15 bg-white text-xs sm:text-sm text-[#10245A] leading-relaxed"
            />

            <button
              type="button"
              onClick={handleCopySocial}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1746D2] hover:bg-[#10245A] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              {copiedSocial ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar texto para {socialTab}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
