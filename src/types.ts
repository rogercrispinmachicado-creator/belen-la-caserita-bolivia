export const BRAND_COLORS = {
  royalBlue: '#1746D2',
  navyBlue: '#10245A',
  fuschia: '#E6007E',
  brightGreen: '#00A83B',
  limeGreen: '#B7E600',
  orange: '#FF6A00',
  yellow: '#FFD500',
  redOrange: '#F04424',
  creamWhite: '#FFF8E7',
} as const;

export const OFFICIAL_PALETTE = [
  { name: 'AZUL REY', hex: '#1746D2' },
  { name: 'AZUL MARINO', hex: '#10245A' },
  { name: 'FUCSIA INTENSO', hex: '#E6007E' },
  { name: 'VERDE BRILLANTE', hex: '#00A83B' },
  { name: 'VERDE LIMA', hex: '#B7E600' },
  { name: 'NARANJA', hex: '#FF6A00' },
  { name: 'AMARILLO', hex: '#FFD500' },
  { name: 'ROJO ANARANJADO', hex: '#F04424' },
  { name: 'BLANCO CREMA', hex: '#FFF8E7' },
] as const;

export const OFFICIAL_LOGO_PATH =
  '/assets/aistudio/file_00000000f8fc820e8d37d56bdc1f24e4_201f899f.png';

export const PRODUCT_CATEGORIES = [
  'Todos',
  'Textiles y Artesanías',
  'Alimentos y Naturales',
  'Hogar y Termos',
  'Ropa y Accesorios',
  'Cuidado Personal',
  'Varios',
] as const;

export interface ProductTestimonial {
  author: string;
  city?: string;
  rating?: number;
  quote: string;
  verifiedDate?: string;
  active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  characteristics: string[];
  benefits: string[];
  usage: string;
  wellnessTip: string;
  unitPrice: number | null;
  promoTitle: string;
  promoQuantity: number | null;
  promoPrice: number | null;
  wholesalePrice: number | null;
  wholesaleMinQuantity: number;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  deliveryInfo: string;
  paymentInfo: string;
  testimonials: ProductTestimonial[];
  active: boolean;
  isExample?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export function getProductImages(product: Pick<Product, 'imageUrl' | 'images'>): string[] {
  const list: string[] = [];
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      const trimmed = typeof img === 'string' ? img.trim() : '';
      if (trimmed && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    }
  }
  if (product.imageUrl && product.imageUrl.trim()) {
    const primary = product.imageUrl.trim();
    if (!list.includes(primary)) {
      list.unshift(primary);
    }
  }
  return list;
}

export function getActiveTestimonials(
  product: Pick<Product, 'testimonials'>
): ProductTestimonial[] {
  if (!Array.isArray(product.testimonials)) return [];
  return product.testimonials.filter(
    (t) => t && t.active !== false && Boolean(t.author?.trim()) && Boolean(t.quote?.trim())
  );
}

export function calculateRatingStats(testimonials: ProductTestimonial[]): {
  count: number;
  average: number;
} {
  const active = testimonials.filter(
    (t) => t && t.active !== false && Boolean(t.author?.trim()) && Boolean(t.quote?.trim())
  );
  if (active.length === 0) {
    return { count: 0, average: 0 };
  }
  const sum = active.reduce((acc, t) => {
    const r = Number(t.rating);
    const clamped = Number.isFinite(r) ? Math.min(5, Math.max(1, Math.round(r))) : 5;
    return acc + clamped;
  }, 0);
  return {
    count: active.length,
    average: Number((sum / active.length).toFixed(1)),
  };
}

export interface HealthTip {
  id: string;
  title: string;
  imageUrl: string;
  recommendation: string;
  explanation: string;
  practicalTips: string[];
  precautions: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSettings {
  brandName: string;
  slogan: string;
  whatsappNumber: string;
  whatsappCountryCode: string;
  supportTitle: string;
  supportText: string;
  defaultDelivery: string;
  defaultPayment: string;
}

export interface TopProductStat {
  id: string;
  name: string;
  category: string;
  views: number;
  imageUrl: string;
}

export interface VisitStats {
  totalVisits: number;
  todayVisits: number;
  todayDate: string;
  topProducts: TopProductStat[];
  storageNotice: string;
}

export interface AdminDashboardData {
  products: Product[];
  healthTips: HealthTip[];
  settings: PublicSettings;
  visitStats: VisitStats;
  dailyHistory: { date: string; count: number }[];
}

export interface AIAnalysisResult {
  suggestedName: string;
  suggestedCategory: string;
  visualDescription: string;
  observableCharacteristics: string[];
  suggestedUsage: string;
  cautionNote: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  usePromo: boolean;
}

export interface SlideDefinition {
  index: number;
  key: string;
  title: string;
  subtitle: string;
  accentHex: string;
}

export const SLIDE_DEFINITIONS: SlideDefinition[] = [
  {
    index: 1,
    key: 'presentacion',
    title: 'Presentación del producto y beneficios verificables',
    subtitle: 'Lámina 1 de 9 · Portada comercial',
    accentHex: BRAND_COLORS.fuschia,
  },
  {
    index: 2,
    key: 'caracteristicas',
    title: 'Características y detalles',
    subtitle: 'Lámina 2 de 9 · Especificaciones reales',
    accentHex: BRAND_COLORS.royalBlue,
  },
  {
    index: 3,
    key: 'precios',
    title: 'Precios y promociones',
    subtitle: 'Lámina 3 de 9 · Cálculo automático de ahorro',
    accentHex: BRAND_COLORS.orange,
  },
  {
    index: 4,
    key: 'entrega',
    title: 'Formas de entrega',
    subtitle: 'Lámina 4 de 9 · Logística y envíos',
    accentHex: BRAND_COLORS.brightGreen,
  },
  {
    index: 5,
    key: 'pago',
    title: 'Formas de pago',
    subtitle: 'Lámina 5 de 9 · Opciones disponibles',
    accentHex: BRAND_COLORS.navyBlue,
  },
  {
    index: 6,
    key: 'testimonios',
    title: 'Testimonios reales',
    subtitle: 'Lámina 6 de 9 · Experiencias verificadas',
    accentHex: BRAND_COLORS.fuschia,
  },
  {
    index: 7,
    key: 'uso',
    title: 'Formas de uso',
    subtitle: 'Lámina 7 de 9 · Recomendaciones prácticas',
    accentHex: BRAND_COLORS.royalBlue,
  },
  {
    index: 8,
    key: 'bienestar',
    title: 'BELÉN TE CUIDA: consejos de bienestar',
    subtitle: 'Lámina 8 de 9 · Cuidado responsable',
    accentHex: BRAND_COLORS.brightGreen,
  },
  {
    index: 9,
    key: 'cierre',
    title: 'Cierre comercial y llamada a comprar',
    subtitle: 'Lámina 9 de 9 · Pedido directo por WhatsApp',
    accentHex: BRAND_COLORS.redOrange,
  },
];

export interface SlideTextOverrides {
  headline: string;
  bodyLines: string[];
  footerNote: string;
}

export function calculatePromoSavings(product: Pick<Product, 'unitPrice' | 'promoQuantity' | 'promoPrice'>) {
  const unit = Number(product.unitPrice);
  const qty = Number(product.promoQuantity);
  const promo = Number(product.promoPrice);
  if (!Number.isFinite(unit) || unit <= 0 || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(promo) || promo <= 0) {
    return null;
  }
  const regularTotal = unit * qty;
  const savings = regularTotal - promo;
  if (savings <= 0) {
    return null;
  }
  const discountPercent = Math.round((savings / regularTotal) * 100);
  return {
    regularTotal,
    promoPrice: promo,
    savings,
    discountPercent,
    unitEffective: promo / qty,
  };
}

export function calculateWholesaleSavings(
  product: Pick<Product, 'unitPrice' | 'wholesalePrice' | 'wholesaleMinQuantity'>
) {
  const wholesaleUnit = Number(product.wholesalePrice);
  const minQty = Number(product.wholesaleMinQuantity) >= 1 ? Number(product.wholesaleMinQuantity) : 3;
  if (!Number.isFinite(wholesaleUnit) || wholesaleUnit <= 0) {
    return null;
  }
  const wholesaleTotal = wholesaleUnit * minQty;
  const unit = Number(product.unitPrice);
  const hasUnitPrice = Number.isFinite(unit) && unit > 0;
  const regularTotal = hasUnitPrice ? unit * minQty : null;
  const savings = regularTotal !== null && regularTotal > wholesaleTotal ? regularTotal - wholesaleTotal : 0;
  const discountPercent =
    regularTotal !== null && savings > 0 ? Math.round((savings / regularTotal) * 100) : 0;

  return {
    minQty,
    wholesaleUnit,
    wholesaleTotal,
    regularTotal,
    savings,
    discountPercent,
  };
}

