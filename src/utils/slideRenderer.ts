import JSZip from 'jszip';
import {
  BRAND_COLORS,
  OFFICIAL_LOGO_PATH,
  Product,
  PublicSettings,
  SLIDE_DEFINITIONS,
  SlideTextOverrides,
  calculatePromoSavings,
  getActiveTestimonials,
} from '../types';

export function buildDefaultSlideOverrides(
  product: Product,
  settings: PublicSettings
): Record<number, SlideTextOverrides> {
  const promo = calculatePromoSavings(product);
  const priceLine = product.unitPrice
    ? `Precio unitario: Bs. ${product.unitPrice.toFixed(2)}`
    : 'Precio unitario: Consultar por WhatsApp';

  const promoLines: string[] = [priceLine];
  if (product.promoTitle && product.promoPrice && product.promoQuantity) {
    promoLines.push(`${product.promoTitle}: ${product.promoQuantity} unidades por Bs. ${product.promoPrice.toFixed(2)}`);
    if (promo) {
      promoLines.push(`Precio normal: Bs. ${promo.regularTotal.toFixed(2)}`);
      promoLines.push(`Ahorro real: Bs. ${promo.savings.toFixed(2)} (${promo.discountPercent}% de descuento)`);
      promoLines.push(`Cada unidad sale a Bs. ${promo.unitEffective.toFixed(2)}`);
    }
  } else {
    promoLines.push('Consulta por paquetes y promociones vigentes con Belén.');
  }

  const activeTestimonials = getActiveTestimonials(product);
  const testimonialLines =
    activeTestimonials.length > 0
      ? activeTestimonials.map((t) => {
          const stars = Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5)));
          return `★ ${stars}/5 «${t.quote}» — ${t.author}${t.city ? ` (${t.city})` : ''}`;
        })
      : [
          'Aún no hay testimonios reales registrados para este producto.',
          'Agrega opiniones reales de tus clientes en el formulario del producto antes de publicar esta lámina.',
        ];

  return {
    1: {
      headline: product.name,
      bodyLines: [
        product.description || 'Agrega una descripción verificable del producto.',
        ...(product.benefits.length > 0
          ? product.benefits
          : ['Agrega beneficios reales y comprobables de este artículo.']),
      ],
      footerNote: `${settings.brandName} · ${product.category}`,
    },
    2: {
      headline: `Detalles de ${product.name}`,
      bodyLines:
        product.characteristics.length > 0
          ? product.characteristics
          : ['Agrega características físicas o especificaciones reales del producto.'],
      footerNote: 'Información verificada del catálogo oficial',
    },
    3: {
      headline: 'Precios y promociones',
      bodyLines: promoLines,
      footerNote: `Sujeto a disponibilidad · WhatsApp ${settings.whatsappNumber}`,
    },
    4: {
      headline: 'Formas de entrega',
      bodyLines: [
        product.deliveryInfo || settings.defaultDelivery,
        'Coordinación directa por WhatsApp para confirmar punto, horario y costo según zona.',
      ],
      footerNote: `Pedidos al ${settings.whatsappNumber}`,
    },
    5: {
      headline: 'Formas de pago',
      bodyLines: [
        product.paymentInfo || settings.defaultPayment,
        'Consulta datos de cuenta o código QR directamente con Belén al confirmar tu pedido.',
      ],
      footerNote: 'Compra transparente y atención personalizada',
    },
    6: {
      headline: 'Testimonios reales',
      bodyLines: testimonialLines,
      footerNote:
        activeTestimonials.length > 0
          ? 'Experiencias reales compartidas por nuestros clientes'
          : 'Solo publicamos opiniones reales verificadas',
    },
    7: {
      headline: 'Formas de uso',
      bodyLines: [
        product.usage ||
          'Describe aquí cómo aprovechar o utilizar correctamente este producto en el día a día.',
      ],
      footerNote: `${product.name} · Guía práctica`,
    },
    8: {
      headline: 'BELÉN TE CUIDA',
      bodyLines: [
        product.wellnessTip ||
          'Agrega un consejo responsable de cuidado, conservación o bienestar relacionado con este producto.',
        'Nota: Consejos generales de bienestar; no sustituyen orientación profesional.',
      ],
      footerNote: 'BELÉN LA CASERITA BOLIVIA · Cuidamos de ti',
    },
    9: {
      headline: '¡TU PRÓXIMA COMPRA ESTÁ AQUÍ!',
      bodyLines: [
        `Pide hoy tu ${product.name} con atención directa.`,
        priceLine,
        promo && product.promoTitle
          ? `Promoción activa: ${product.promoTitle} a Bs. ${promo.promoPrice.toFixed(2)}`
          : 'Consulta promociones vigentes por WhatsApp.',
        `Escríbenos al WhatsApp: ${settings.whatsappNumber}`,
      ],
      footerNote: `«${settings.slogan}»`,
    },
  };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawAndeanCenefa(ctx: CanvasRenderingContext2D, y: number, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = BRAND_COLORS.navyBlue;
  ctx.fillRect(0, y, width, height);

  ctx.fillStyle = BRAND_COLORS.fuschia;
  ctx.fillRect(0, y, width, 6);

  ctx.fillStyle = BRAND_COLORS.brightGreen;
  ctx.fillRect(0, y + height - 6, width, 6);

  const step = 90;
  const diamondColors = [
    BRAND_COLORS.yellow,
    BRAND_COLORS.limeGreen,
    BRAND_COLORS.orange,
  ];
  const innerColors = [
    BRAND_COLORS.redOrange,
    BRAND_COLORS.royalBlue,
    BRAND_COLORS.creamWhite,
  ];

  for (let x = 0; x < width + step; x += step) {
    const idx = Math.floor(x / step) % 3;
    const cx = x + step / 2;
    const cy = y + height / 2;

    ctx.fillStyle = diamondColors[idx];
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11);
    ctx.lineTo(cx + 15, cy);
    ctx.lineTo(cx, cy + 11);
    ctx.lineTo(cx - 15, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = innerColors[idx];
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + 7, cy);
    ctx.lineTo(cx, cy + 5);
    ctx.lineTo(cx - 7, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

export async function renderSlideToDataUrl(
  slideIndex: number,
  product: Product,
  settings: PublicSettings,
  override: SlideTextOverrides
): Promise<string> {
  const WIDTH = 1080;
  const HEIGHT = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el lienzo 2D.');

  const slideDef =
    SLIDE_DEFINITIONS.find((s) => s.index === slideIndex) || SLIDE_DEFINITIONS[0];

  const [logoImg, productImg] = await Promise.all([
    loadImage(OFFICIAL_LOGO_PATH),
    loadImage(product.imageUrl),
  ]);

  // Background
  ctx.fillStyle = slideIndex === 9 ? BRAND_COLORS.navyBlue : '#FFFFFF';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle cream panel in middle for readability on light slides
  if (slideIndex !== 9) {
    ctx.fillStyle = BRAND_COLORS.creamWhite;
    ctx.fillRect(0, 36, WIDTH, 210);
  }

  // Top & Bottom Andean Cenefa
  drawAndeanCenefa(ctx, 0, WIDTH, 36);
  drawAndeanCenefa(ctx, HEIGHT - 36, WIDTH, 36);

  // Header Area (Logo + Brand + Slide Number)
  if (logoImg) {
    const maxLogoW = 210;
    const maxLogoH = 175;
    const scale = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height);
    const drawW = logoImg.width * scale;
    const drawH = logoImg.height * scale;
    ctx.drawImage(logoImg, 68, 56 + (maxLogoH - drawH) / 2, drawW, drawH);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = slideIndex === 9 ? '#FFFFFF' : BRAND_COLORS.navyBlue;
  ctx.font = '800 32px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(settings.brandName, 300, 118);

  ctx.fillStyle = slideIndex === 9 ? BRAND_COLORS.yellow : slideDef.accentHex;
  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(slideDef.subtitle.toUpperCase(), 300, 162);

  // Color divider bar using official 9-color palette
  const paletteStrip = [
    BRAND_COLORS.royalBlue,
    BRAND_COLORS.navyBlue,
    BRAND_COLORS.fuschia,
    BRAND_COLORS.brightGreen,
    BRAND_COLORS.limeGreen,
    BRAND_COLORS.orange,
    BRAND_COLORS.yellow,
    BRAND_COLORS.redOrange,
    BRAND_COLORS.creamWhite,
  ];
  const barX = 300;
  const barY = 186;
  const segW = 78;
  paletteStrip.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(barX + i * segW, barY, segW, 8);
  });

  // Product Photo Card
  const photoX = 72;
  const photoY = 280;
  const photoW = WIDTH - 144;
  const photoH = slideIndex === 9 ? 540 : 620;

  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 32);
  ctx.fillStyle = slideIndex === 9 ? '#FFFFFF' : BRAND_COLORS.creamWhite;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = slideDef.accentHex;
  ctx.stroke();
  ctx.clip();

  if (productImg) {
    const imgScale = Math.max(photoW / productImg.width, photoH / productImg.height);
    const drawW = productImg.width * imgScale;
    const drawH = productImg.height * imgScale;
    const drawX = photoX + (photoW - drawW) / 2;
    const drawY = photoY + (photoH - drawH) / 2;
    ctx.drawImage(productImg, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = BRAND_COLORS.navyBlue;
    ctx.font = '700 32px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, WIDTH / 2, photoY + photoH / 2);
  }
  ctx.restore();

  // Headline
  const contentStartY = photoY + photoH + 76;
  ctx.textAlign = 'left';
  ctx.fillStyle = slideIndex === 9 ? BRAND_COLORS.yellow : BRAND_COLORS.navyBlue;
  ctx.font = '800 54px "Outfit", "Plus Jakarta Sans", sans-serif';
  const headlineLines = wrapText(ctx, override.headline || product.name, WIDTH - 144).slice(0, 2);

  let cursorY = contentStartY;
  for (const line of headlineLines) {
    ctx.fillText(line, 72, cursorY);
    cursorY += 66;
  }

  // Accent underline
  ctx.fillStyle = slideDef.accentHex;
  drawRoundedRect(ctx, 72, cursorY - 22, 180, 10, 5);
  ctx.fill();
  cursorY += 36;

  // Content Card
  const cardX = 72;
  const cardY = cursorY;
  const cardW = WIDTH - 144;
  const cardH = 1690 - cardY;

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = slideIndex === 9 ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle =
    slideIndex === 9 ? 'rgba(255,255,255,0.22)' : 'rgba(16,36,90,0.12)';
  ctx.stroke();
  ctx.restore();

  // Body lines inside card
  let textY = cardY + 64;
  const maxTextW = cardW - 88;
  const bodyLines = override.bodyLines.filter((l) => l.trim().length > 0);

  ctx.font = '600 33px "Plus Jakarta Sans", sans-serif';
  for (let i = 0; i < bodyLines.length; i++) {
    const rawLine = bodyLines[i];
    const isHighlight =
      slideIndex === 3 && (rawLine.includes('Ahorro') || rawLine.includes('Promoción'));

    ctx.fillStyle =
      slideIndex === 9
        ? i === bodyLines.length - 1
          ? BRAND_COLORS.limeGreen
          : '#FFFFFF'
        : isHighlight
        ? BRAND_COLORS.brightGreen
        : BRAND_COLORS.navyBlue;

    const bulletPrefix = bodyLines.length > 1 && !rawLine.startsWith('«') ? '• ' : '';
    const wrapped = wrapText(ctx, `${bulletPrefix}${rawLine}`, maxTextW);

    for (const wLine of wrapped) {
      if (textY > cardY + cardH - 36) break;
      ctx.fillText(wLine, cardX + 44, textY);
      textY += 46;
    }
    textY += 16;
  }

  // Bottom CTA / Footer Strip above lower cenefa
  const footerY = 1726;
  ctx.save();
  drawRoundedRect(ctx, 72, footerY, WIDTH - 144, 122, 24);
  ctx.fillStyle =
    slideIndex === 9 ? BRAND_COLORS.brightGreen : BRAND_COLORS.royalBlue;
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(override.footerNote || `«${settings.slogan}»`, 108, footerY + 50);

  ctx.fillStyle = BRAND_COLORS.yellow;
  ctx.font = '800 32px "Outfit", sans-serif';
  ctx.fillText(`WhatsApp directo: ${settings.whatsappNumber}`, 108, footerY + 95);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

export async function exportAllSlidesZip(
  product: Product,
  settings: PublicSettings,
  overridesBySlide: Record<number, SlideTextOverrides>
): Promise<Blob> {
  const zip = new JSZip();
  const safeSlug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');

  for (const def of SLIDE_DEFINITIONS) {
    const override = overridesBySlide[def.index];
    const dataUrl = await renderSlideToDataUrl(def.index, product, settings, override);
    const base64 = dataUrl.split(',')[1];
    zip.file(`lamina-0${def.index}-${def.key}-${safeSlug || 'producto'}.png`, base64, {
      base64: true,
    });
  }

  return zip.generateAsync({ type: 'blob' });
}
