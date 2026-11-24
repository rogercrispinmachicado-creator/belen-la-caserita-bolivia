import React, { useMemo, useState } from 'react';
import {
  Search,
  MessageCircle,
  PhoneCall,
  Eye,
  Users,
  TrendingUp,
  Plus,
  Info,
  Sparkles,
  Tag,
  Star,
} from 'lucide-react';
import {
  OFFICIAL_LOGO_PATH,
  PRODUCT_CATEGORIES,
  Product,
  PublicSettings,
  VisitStats,
  calculatePromoSavings,
  calculateRatingStats,
  calculateWholesaleSavings,
  getProductImages,
} from '../types';
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductCarousel } from './ProductCarousel';
import { ProductVideoSection } from './VideoActionButton';
import { AndeanBorder, BrandPaletteStrip } from './AndeanBorder';

interface StorefrontProps {
  products: Product[];
  settings: PublicSettings;
  visitStats: VisitStats;
  onSelectProduct: (product: Product) => void;
  onAddToOrder: (product: Product, usePromo: boolean) => void;
  onOpenAdmin: () => void;
  onOpenHealthAdvice: () => void;
}

export function Storefront({
  products,
  settings,
  visitStats,
  onSelectProduct,
  onAddToOrder,
  onOpenAdmin,
  onOpenHealthAdvice,
}: StorefrontProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyPromos, setOnlyPromos] = useState<boolean>(false);
  const [expandedVideoIds, setExpandedVideoIds] = useState<Record<string, boolean>>({});

  const toggleProductVideo = (productId: string) => {
    setExpandedVideoIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const availableCategories = useMemo(() => {
    const dynamicCats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    const merged = Array.from(new Set([...PRODUCT_CATEGORIES, ...dynamicCats]));
    return merged;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== 'Todos' && product.category !== selectedCategory) {
        return false;
      }
      if (onlyPromos && !calculatePromoSavings(product)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [products, selectedCategory, onlyPromos, searchQuery]);

  const promoProducts = useMemo(
    () => products.filter((p) => Boolean(calculatePromoSavings(p))),
    [products]
  );

  const generalOrderUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('hacer_pedido')
  );
  const talkToBelenUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('hablar_belen')
  );
  const supportUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('soporte')
  );

  return (
    <main className="pb-20 md:pb-8">
      {/* 1. Portada / Hero con Logotipo Oficial y Llamada a la Acción */}
      <section className="bg-[#FFF8E7] border-b border-[#10245A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#10245A]/10 shadow-sm w-full max-w-[340px] flex items-center justify-center">
                <img
                  src={OFFICIAL_LOGO_PATH}
                  alt="Logotipo oficial de BELÉN LA CASERITA BOLIVIA con niño andino y llamita"
                  className="w-full h-auto max-h-[290px] object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#E6007E]">
                  {settings.brandName}
                </p>
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#10245A] leading-tight text-balance">
                  ¡TU PRÓXIMA COMPRA ESTÁ AQUÍ!
                </h1>
                <p className="text-base sm:text-lg text-[#10245A]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Consulta nuestros productos, promociones y ofertas.{' '}
                  <span className="font-semibold text-[#10245A]">
                    «{settings.slogan}»
                  </span>
                </p>
              </div>

              <BrandPaletteStrip className="max-w-md mx-auto lg:mx-0" />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
                <a
                  href={generalOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <span>HACER MI PEDIDO</span>
                </a>
                <a
                  href={talkToBelenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-[#1746D2] hover:bg-[#10245A] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-colors"
                >
                  <PhoneCall className="w-5 h-5 shrink-0" />
                  <span>HABLAR CON BELÉN · {settings.whatsappNumber}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Contador Real de Visitantes */}
      <section aria-label="Estadísticas de visitas del catálogo" className="bg-white border-b border-[#10245A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#10245A]/10 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#1746D2]/10 text-[#1746D2] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#10245A]/65">
                  Total de visitas reales
                </p>
                <p className="font-display font-extrabold text-2xl text-[#10245A] tabular-nums">
                  {visitStats.totalVisits}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#10245A]/10 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E6007E]/10 text-[#E6007E] flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#10245A]/65">
                  Visitas de hoy ({visitStats.todayDate})
                </p>
                <p className="font-display font-extrabold text-2xl text-[#10245A] tabular-nums">
                  {visitStats.todayVisits}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#10245A]/10 flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#00A83B]/10 text-[#00A83B] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#10245A]/65">
                  Productos más visitados
                </p>
                {visitStats.topProducts.length > 0 &&
                visitStats.topProducts.some((p) => p.views > 0) ? (
                  <div className="mt-1 space-y-0.5">
                    {visitStats.topProducts
                      .filter((p) => p.views > 0)
                      .slice(0, 2)
                      .map((tp) => {
                        const fullProd = products.find((p) => p.id === tp.id);
                        return (
                          <button
                            key={tp.id}
                            type="button"
                            onClick={() => fullProd && onSelectProduct(fullProd)}
                            className="w-full text-left text-xs font-semibold text-[#10245A] hover:text-[#1746D2] flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="truncate">{tp.name}</span>
                            <span className="font-mono text-[#00A83B] tabular-nums shrink-0">
                              {tp.views} vistas
                            </span>
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-xs text-[#10245A]/70 mt-1">
                    Abre un producto para registrar sus vistas reales.
                  </p>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-[#10245A]/55">
            Datos reales registrados por la aplicación al visitar el catálogo y consultar productos.
          </p>
        </div>
      </section>

      {/* 3. Promociones Destacadas */}
      {promoProducts.length > 0 && (
        <section id="seccion-promociones" className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#10245A]">
                Promociones y Paquetes Destacados
              </h2>
              <p className="text-sm text-[#10245A]/70">
                Ahorro calculado automáticamente sobre el precio unitario.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOnlyPromos((prev) => !prev);
                document
                  .getElementById('catalogo-productos')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFD500] hover:bg-[#FF6A00] hover:text-white text-[#10245A] font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {onlyPromos ? 'Ver todos' : 'Filtrar ofertas'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {promoProducts.slice(0, 4).map((prod) => {
              const savings = calculatePromoSavings(prod);
              if (!savings) return null;
              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#FF6A00]/30 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#E6007E]">
                      <span className="truncate">{prod.promoTitle}</span>
                      <span className="tabular-nums shrink-0 text-[#00A83B]">
                        -{savings.discountPercent}%
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-[#10245A] mt-1 line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#10245A]/70 mt-1 tabular-nums">
                      {prod.promoQuantity} unid. a{' '}
                      <strong className="text-[#10245A]">
                        Bs. {savings.promoPrice.toFixed(2)}
                      </strong>{' '}
                      (ahorras Bs. {savings.savings.toFixed(2)})
                    </p>
                  </div>
                  <a
                    href={buildWhatsAppUrl(
                      settings,
                      buildProductWhatsAppMessage('quiero_comprar', prod, true)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#F04424] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span>QUIERO ESTA PROMO</span>
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Catálogo Completo con Filtros y Búsqueda */}
      <section id="catalogo-productos" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#10245A]">
              Catálogo de Productos
            </h2>
            <p className="text-sm text-[#10245A]/70 mt-1">
              Toca cualquier producto para ver características, precios y pedir por WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#10245A]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto..."
                aria-label="Buscar producto"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#10245A]/20 bg-white text-sm text-[#10245A] placeholder:text-[#10245A]/45 focus:outline-2 focus:outline-[#1746D2]"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlyPromos((prev) => !prev)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                onlyPromos
                  ? 'bg-[#E6007E] text-white border-[#E6007E]'
                  : 'bg-white text-[#10245A] border-[#10245A]/20 hover:bg-[#FFF8E7]'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Solo promociones</span>
            </button>
          </div>
        </div>

        {/* Category Segmented Buttons */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-3 mb-6"
          role="tablist"
          aria-label="Categorías de productos"
        >
          {availableCategories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#10245A] text-white'
                    : 'bg-[#FFF8E7] text-[#10245A] hover:bg-[#FFD500]/35'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/10 text-center space-y-3">
            <p className="font-display font-bold text-lg text-[#10245A]">
              No encontramos productos con ese filtro
            </p>
            <p className="text-sm text-[#10245A]/70">
              Prueba otra categoría o limpia la búsqueda para ver todo el catálogo disponible.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
                setOnlyPromos(false);
              }}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#1746D2] text-white text-sm font-bold cursor-pointer"
            >
              Mostrar todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const promoSavings = calculatePromoSavings(product);
              const wholesaleSavings = calculateWholesaleSavings(product);
              const directPurchaseUrl = buildWhatsAppUrl(
                settings,
                buildProductWhatsAppMessage('comprar_directo', product)
              );
              const wholesaleConsultUrl = buildWhatsAppUrl(
                settings,
                buildProductWhatsAppMessage('consultar_mayor', product)
              );
              const buyUrl = buildWhatsAppUrl(
                settings,
                buildProductWhatsAppMessage('quiero_comprar', product, false)
              );
              const consultUrl = buildWhatsAppUrl(
                settings,
                buildProductWhatsAppMessage('consultar', product, false)
              );

              const productImages = getProductImages(product);
              const isVideoExpanded = Boolean(expandedVideoIds[product.id]);
              const ratingStats = calculateRatingStats(product.testimonials || []);

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#10245A]/12 overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <div className="border-b border-[#10245A]/8">
                      <ProductCarousel
                        images={productImages}
                        alt={product.name}
                        onImageClick={() => onSelectProduct(product)}
                        resetKey={product.id}
                      />
                    </div>

                    <div className="px-5 pt-4">
                      <a
                        href={directPurchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                      >
                        <MessageCircle className="w-5 h-5 shrink-0" />
                        <span>COMPRAR POR WHATSAPP</span>
                      </a>
                    </div>

                    <div className="px-5 pt-4 pb-5 space-y-2.5">
                      {/* Unboxed metadata line (zero pill badges) */}
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#10245A]/60">
                        <span className="truncate text-[#1746D2]">{product.category}</span>
                        {product.isExample && (
                          <span className="shrink-0">Ejemplo editable</span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-lg text-[#10245A] leading-snug">
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="text-left hover:text-[#E6007E] transition-colors cursor-pointer"
                        >
                          {product.name}
                        </button>
                      </h3>

                      {ratingStats.count > 0 && (
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10245A] hover:text-[#E6007E] cursor-pointer tabular-nums"
                        >
                          <Star className="w-3.5 h-3.5 text-[#FF6A00] fill-[#FFD500] shrink-0" />
                          <span>{ratingStats.average.toFixed(1)}</span>
                          <span className="text-[#10245A]/60 font-semibold">
                            ({ratingStats.count}{' '}
                            {ratingStats.count === 1 ? 'experiencia' : 'experiencias'})
                          </span>
                        </button>
                      )}

                      {product.description && (
                        <p className="text-sm text-[#10245A]/75 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}

                      <div className="pt-1 flex items-baseline justify-between gap-2">
                        <div>
                          <span className="font-display font-extrabold text-2xl text-[#10245A] tabular-nums">
                            {product.unitPrice
                              ? `Bs. ${product.unitPrice.toFixed(2)}`
                              : 'Consultar precio'}
                          </span>
                          <span className="block text-xs text-[#10245A]/55">
                            Precio unitario
                          </span>
                        </div>

                        {promoSavings && (
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#E6007E] block">
                              {product.promoTitle}
                            </span>
                            <span className="text-sm font-extrabold text-[#00A83B] tabular-nums">
                              Bs. {promoSavings.promoPrice.toFixed(2)} (-{promoSavings.discountPercent}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {wholesaleSavings && (
                        <div className="pt-2 border-t border-[#10245A]/10 text-xs text-[#10245A]/80 tabular-nums space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#1746D2]">
                              Por mayor (mín. {wholesaleSavings.minQty} unid.):
                            </span>
                            <span className="font-extrabold text-[#10245A]">
                              Bs. {wholesaleSavings.wholesaleUnit.toFixed(2)} c/u
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span>Total: Bs. {wholesaleSavings.wholesaleTotal.toFixed(2)}</span>
                            {wholesaleSavings.savings > 0 && (
                              <span className="font-bold text-[#00A83B]">
                                Ahorro Bs. {wholesaleSavings.savings.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <ProductVideoSection
                        product={product}
                        settings={settings}
                        isExpanded={isVideoExpanded}
                        onToggle={() => toggleProductVideo(product.id)}
                        playerMaxWidthClass="max-w-[240px]"
                      />
                    </div>
                  </div>

                  {/* Card CTAs */}
                  <div className="px-5 pb-5 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">QUIERO COMPRAR</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => onAddToOrder(product, false)}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-[#1746D2] hover:bg-[#10245A] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span className="truncate">Al pedido</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={consultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-[#FFF8E7] hover:bg-[#FFD500]/35 text-[#10245A] border border-[#10245A]/12 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="truncate">CONSULTAR</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#FFF8E7] text-[#10245A] border border-[#10245A]/12 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">MÁS INFORMACIÓN</span>
                      </button>
                    </div>

                    <a
                      href={wholesaleConsultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#F04424] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate">CONSULTAR PRECIO POR MAYOR</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Sección de Atención al Cliente — BELÉN TE ATIENDE */}
      <section
        id="belen-te-atiende"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
      >
        <div className="rounded-3xl bg-[#10245A] text-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FFD500]">
              Atención directa · WhatsApp {settings.whatsappNumber}
            </p>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              {settings.supportTitle}
            </h2>
            <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
              {settings.supportText}
            </p>
            <p className="text-sm font-bold text-[#B7E600] tabular-nums">
              Soporte oficial: {settings.whatsappNumber}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <a
              href={talkToBelenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-colors"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>HABLAR CON BELÉN</span>
            </a>

            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#E6007E] hover:bg-[#c5006c] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-colors"
            >
              <PhoneCall className="w-5 h-5 shrink-0" />
              <span>NECESITO SOPORTE</span>
            </a>

            <a
              href={generalOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#FFD500] hover:bg-[#FF6A00] hover:text-white text-[#10245A] font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-colors"
            >
              <span>ESCRÍBENOS POR WHATSAPP · {settings.whatsappNumber}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Sección Especial: BELÉN TE CUIDA – PLUS DE SALUD Y BIENESTAR */}
      <section
        id="belen-te-cuida-plus"
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-8"
      >
        <div className="rounded-3xl bg-[#FFF8E7] border border-[#E6007E]/25 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#00A83B]">
              Plus de bienestar · {settings.brandName}
            </p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#10245A]">
              BELÉN TE CUIDA – PLUS DE SALUD Y BIENESTAR
            </h2>
            <p className="text-sm sm:text-base text-[#10245A]/80 leading-relaxed">
              Explora recomendaciones prácticas, explicaciones claras y cuidados cotidianos preparados para tu bienestar.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenHealthAdvice}
            className="min-h-[52px] px-6 py-3.5 rounded-xl bg-[#E6007E] hover:bg-[#c5006c] text-white font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>❤️ DESCUBRIR CONSEJO DE SALUD</span>
          </button>
        </div>
      </section>

      {/* 7. Cierre del Catálogo */}
      <footer className="mt-8 bg-[#FFF8E7] border-t border-[#10245A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={OFFICIAL_LOGO_PATH}
              alt="Logotipo BELÉN LA CASERITA BOLIVIA"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div>
              <p className="font-display font-extrabold text-base text-[#10245A]">
                {settings.brandName}
              </p>
              <p className="text-sm text-[#10245A]/75 italic">
                «{settings.slogan}»
              </p>
              <p className="text-xs text-[#10245A]/60 mt-0.5 tabular-nums">
                WhatsApp oficial: {settings.whatsappNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <a
              href={generalOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00A83B] hover:underline"
            >
              WhatsApp Directo
            </a>
            <span aria-hidden="true" className="text-[#10245A]/30">
              ·
            </span>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-[#1746D2] hover:underline cursor-pointer"
            >
              Panel de Administración
            </button>
          </div>
        </div>
        <AndeanBorder />
      </footer>
    </main>
  );
}
