import React, { useEffect, useState } from 'react';
import {
  X,
  MessageCircle,
  Plus,
  Check,
  Truck,
  CreditCard,
  HeartHandshake,
  PackageCheck,
  Star,
  BadgeCheck,
} from 'lucide-react';
import {
  Product,
  PublicSettings,
  calculatePromoSavings,
  calculateRatingStats,
  calculateWholesaleSavings,
  getActiveTestimonials,
  getProductImages,
} from '../types';
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductCarousel } from './ProductCarousel';
import { ProductVideoSection } from './VideoActionButton';

interface ProductModalProps {
  product: Product | null;
  settings: PublicSettings;
  onClose: () => void;
  onAddToOrder: (product: Product, usePromo: boolean) => void;
}

export function ProductModal({
  product,
  settings,
  onClose,
  onAddToOrder,
}: ProductModalProps) {
  const [usePromo, setUsePromo] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);

  useEffect(() => {
    setVideoExpanded(false);
  }, [product?.id]);

  if (!product) return null;

  const promoSavings = calculatePromoSavings(product);
  const wholesaleSavings = calculateWholesaleSavings(product);
  const activeTestimonials = getActiveTestimonials(product);
  const ratingStats = calculateRatingStats(activeTestimonials);
  const hasPromo = Boolean(product.promoTitle && product.promoPrice && product.promoQuantity);
  const minWholesaleQty =
    product.wholesaleMinQuantity >= 1 ? product.wholesaleMinQuantity : 3;

  const handleAdd = () => {
    onAddToOrder(product, usePromo && hasPromo);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1600);
  };

  const directBuyUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('comprar_directo', product)
  );
  const wholesaleConsultUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('consultar_mayor', product)
  );
  const buyUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('quiero_comprar', product, usePromo && hasPromo)
  );
  const consultUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('consultar', product, usePromo && hasPromo)
  );
  const infoUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('mas_informacion', product, usePromo && hasPromo)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#10245A]/60 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl border border-[#10245A]/15 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1.5 bg-[#10245A]/20 rounded-full mx-auto mt-3 mb-1" />

        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 py-4 border-b border-[#10245A]/10 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1746D2] truncate">
              {product.category}
            </p>
            <h2
              id="modal-product-title"
              className="font-display font-bold text-lg sm:text-xl text-[#10245A] truncate"
            >
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#FFF8E7] text-[#10245A] hover:bg-[#FFD500]/30 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="max-w-md mx-auto w-full rounded-2xl overflow-hidden bg-white border border-[#10245A]/12">
            <ProductCarousel
              images={getProductImages(product)}
              alt={product.name}
              resetKey={product.id}
            />
          </div>

          <a
            href={directBuyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>COMPRAR POR WHATSAPP</span>
          </a>

          {/* Precio Unitario y Precio Promocional */}
          <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/10 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#10245A]/65 block">
                  Precio unitario
                </span>
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#10245A] tabular-nums">
                  {product.unitPrice ? `Bs. ${product.unitPrice.toFixed(2)}` : 'Consultar'}
                </span>
              </div>
              {hasPromo && (
                <div className="text-right">
                  <span className="text-xs font-bold text-[#E6007E] block">
                    Precio promocional · {product.promoTitle} ({product.promoQuantity} unid.)
                  </span>
                  <span className="font-display font-extrabold text-xl text-[#00A83B] tabular-nums">
                    Bs. {product.promoPrice?.toFixed(2)}
                  </span>
                  {promoSavings && (
                    <span className="block text-xs font-bold text-[#00A83B] tabular-nums">
                      Ahorras Bs. {promoSavings.savings.toFixed(2)} (-{promoSavings.discountPercent}%)
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasPromo && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#10245A]/10">
                <button
                  type="button"
                  onClick={() => setUsePromo(false)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    !usePromo
                      ? 'bg-[#10245A] text-white'
                      : 'bg-white text-[#10245A] border border-[#10245A]/15'
                  }`}
                >
                  Por unidad
                </button>
                <button
                  type="button"
                  onClick={() => setUsePromo(true)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    usePromo
                      ? 'bg-[#E6007E] text-white'
                      : 'bg-white text-[#10245A] border border-[#10245A]/15'
                  }`}
                >
                  {product.promoTitle}
                </button>
              </div>
            )}
          </div>

          {/* Precio Especial por Mayor + Cálculo Automático */}
          <div className="p-4 rounded-2xl bg-[#1746D2]/6 border border-[#1746D2]/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1746D2]">
                <PackageCheck className="w-4 h-4 shrink-0" />
                <span>Precio especial por mayor</span>
              </div>
              <span className="text-xs font-bold text-[#10245A] tabular-nums">
                Compra mínima por mayor: {minWholesaleQty} unidades
              </span>
            </div>

            {wholesaleSavings ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-sm tabular-nums">
                <div className="p-3 rounded-xl bg-white border border-[#10245A]/10">
                  <span className="text-xs text-[#10245A]/65 block">Precio por unidad</span>
                  <strong className="font-display text-lg text-[#10245A]">
                    Bs. {wholesaleSavings.wholesaleUnit.toFixed(2)}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#10245A]/10">
                  <span className="text-xs text-[#10245A]/65 block">
                    Total ({wholesaleSavings.minQty} unid.)
                  </span>
                  <strong className="font-display text-lg text-[#1746D2]">
                    Bs. {wholesaleSavings.wholesaleTotal.toFixed(2)}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#00A83B]/25">
                  <span className="text-xs text-[#00A83B] font-semibold block">
                    Ahorro por mayor
                  </span>
                  <strong className="font-display text-lg text-[#00A83B]">
                    {wholesaleSavings.savings > 0
                      ? `Bs. ${wholesaleSavings.savings.toFixed(2)} (-${wholesaleSavings.discountPercent}%)`
                      : 'Precio preferencial'}
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#10245A]/80">
                Compra mínima por mayor: {minWholesaleQty} unidades. Consulta tu cotización directa por WhatsApp.
              </p>
            )}

            <a
              href={wholesaleConsultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#F04424] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>CONSULTAR PRECIO POR MAYOR</span>
            </a>
          </div>

          {product.description && (
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-base text-[#10245A]">
                Descripción
              </h3>
              <p className="text-sm sm:text-base text-[#10245A]/85 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {product.benefits.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#10245A]">
                Beneficios del producto
              </h3>
              <ul className="space-y-1.5 text-sm text-[#10245A]/85">
                {product.benefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#00A83B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.characteristics.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#10245A]">
                Detalles y características del producto
              </h3>
              <ul className="space-y-1.5 text-sm text-[#10245A]/85">
                {product.characteristics.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1746D2] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.usage && (
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-base text-[#10245A]">
                Forma de uso del producto
              </h3>
              <p className="text-sm text-[#10245A]/85 leading-relaxed">{product.usage}</p>
            </div>
          )}

          {product.wellnessTip && (
            <div className="p-4 rounded-2xl bg-[#00A83B]/8 border border-[#00A83B]/20 space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-[#00A83B]">
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>BELÉN TE CUIDA</span>
              </div>
              <p className="text-sm text-[#10245A]/85 leading-relaxed">
                {product.wellnessTip}
              </p>
            </div>
          )}

          <ProductVideoSection
            product={product}
            settings={settings}
            isExpanded={videoExpanded}
            onToggle={() => setVideoExpanded((prev) => !prev)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#10245A]/80 pt-2 border-t border-[#10245A]/10">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#10245A] block">Formas de entrega</span>
                <span>{product.deliveryInfo || settings.defaultDelivery}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-[#1746D2] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#10245A] block">Formas de pago</span>
                <span>{product.paymentInfo || settings.defaultPayment}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#10245A]/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-bold text-base text-[#10245A]">
                Experiencias y Testimonios
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#10245A] tabular-nums">
                <div className="flex items-center gap-0.5" aria-label={`Calificación promedio ${ratingStats.average} de 5`}>
                  {[1, 2, 3, 4, 5].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-4 h-4 ${
                        ratingStats.count > 0 && starIdx <= Math.round(ratingStats.average)
                          ? 'text-[#FF6A00] fill-[#FFD500]'
                          : 'text-[#10245A]/20'
                      }`}
                    />
                  ))}
                </div>
                {ratingStats.count > 0 ? (
                  <span>
                    {ratingStats.average.toFixed(1)} · {ratingStats.count}{' '}
                    {ratingStats.count === 1 ? 'opinión' : 'opiniones'}
                  </span>
                ) : (
                  <span className="text-[#10245A]/60 font-medium">
                    Sin opiniones aún
                  </span>
                )}
              </div>
            </div>

            {activeTestimonials.length > 0 ? (
              <div className="space-y-2.5">
                {activeTestimonials.map((t, i) => {
                  const stars = Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5)));
                  return (
                    <blockquote
                      key={i}
                      className="p-3.5 rounded-xl bg-[#FFF8E7] border border-[#10245A]/10 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5" aria-label={`${stars} de 5 estrellas`}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= stars
                                  ? 'text-[#FF6A00] fill-[#FFD500]'
                                  : 'text-[#10245A]/20'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A83B]">
                          <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Compra verificada</span>
                        </span>
                      </div>

                      <p className="text-sm text-[#10245A]/90 leading-relaxed">
                        «{t.quote}»
                      </p>

                      <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#10245A]/70">
                        <span className="font-bold text-[#10245A]">
                          — {t.author}
                          {t.city ? ` (${t.city}, Bolivia)` : ''}
                        </span>
                        {t.verifiedDate && (
                          <span className="font-mono text-[11px] text-[#10245A]/55">
                            {t.verifiedDate}
                          </span>
                        )}
                      </footer>
                    </blockquote>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#10245A]/70 bg-[#FFF8E7]/70 p-3 rounded-xl">
                Aún no hay experiencias registradas para este artículo; solo publicamos reseñas reales de clientes verificados.
              </p>
            )}

            <p className="text-[11px] text-[#10245A]/60 leading-relaxed">
              Las experiencias compartidas reflejan opiniones personales de uso y bienestar; este producto no sustituye atención médica profesional.
            </p>
          </div>

          {/* Direct Action Buttons */}
          <div className="space-y-2.5 pt-3 border-t border-[#10245A]/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-4 py-3 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>QUIERO COMPRAR</span>
              </a>
              <button
                type="button"
                onClick={handleAdd}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-[#1746D2] hover:bg-[#10245A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Agregado a tu pedido</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Agregar a mi pedido</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={consultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FFF8E7] hover:bg-[#FFD500]/40 text-[#10245A] border border-[#10245A]/15 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#00A83B] shrink-0" />
                <span>CONSULTAR POR WHATSAPP</span>
              </a>
              <a
                href={infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF8E7] text-[#10245A] border border-[#10245A]/15 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>MÁS INFORMACIÓN</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

