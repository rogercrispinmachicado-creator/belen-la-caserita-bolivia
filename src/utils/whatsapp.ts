import { OrderItem, Product, PublicSettings, calculatePromoSavings } from '../types';

export type WhatsAppIntent =
  | 'comprar_directo'
  | 'consultar_mayor'
  | 'quiero_comprar'
  | 'consultar'
  | 'mas_informacion'
  | 'solicitar_video'
  | 'hablar_belen'
  | 'soporte'
  | 'hacer_pedido';

export function buildWhatsAppUrl(
  settings: Pick<PublicSettings, 'whatsappCountryCode' | 'whatsappNumber'>,
  message: string
): string {
  const code = (settings.whatsappCountryCode || '591').replace(/\D/g, '');
  const phone = (settings.whatsappNumber || '68048514').replace(/\D/g, '');
  const cleanPhone = phone.startsWith(code) ? phone : `${code}${phone}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(
  intent: WhatsAppIntent,
  product?: Product,
  usePromo?: boolean
): string {
  if (!product) {
    if (intent === 'soporte') {
      return 'Hola Belén, necesito soporte y ayuda con el catálogo de BELÉN LA CASERITA BOLIVIA.';
    }
    if (intent === 'hablar_belen') {
      return 'Hola Belén, vi el catálogo de BELÉN LA CASERITA BOLIVIA y me gustaría conversar contigo.';
    }
    return 'Hola Belén, quiero hacer un pedido de BELÉN LA CASERITA BOLIVIA. ¿Me ayudas por favor?';
  }

  if (intent === 'comprar_directo') {
    return `Hola, BELÉN LA CASERITA BOLIVIA. Estoy interesado/a en comprar este producto: ${product.name}. ¿Me pueden brindar información para realizar mi pedido?`;
  }

  if (intent === 'solicitar_video') {
    return `Hola, BELÉN LA CASERITA BOLIVIA. Quisiera ver el video de uso real del producto: ${product.name}. ¿Me lo pueden enviar por favor?`;
  }

  if (intent === 'consultar_mayor') {
    const minQty = product.wholesaleMinQuantity >= 1 ? product.wholesaleMinQuantity : 3;
    const wholesaleText = product.wholesalePrice
      ? `Precio especial por mayor: Bs. ${product.wholesalePrice.toFixed(2)} c/u (mínimo ${minQty} unidades, total Bs. ${(product.wholesalePrice * minQty).toFixed(2)}).`
      : `Compra mínima por mayor: ${minQty} unidades.`;
    return `Hola, BELÉN LA CASERITA BOLIVIA. Quiero CONSULTAR PRECIO POR MAYOR para el producto: ${product.name}. ${wholesaleText} ¿Me confirman disponibilidad?`;
  }

  const priceLine =
    usePromo && product.promoTitle && product.promoPrice
      ? `${product.promoTitle} (${product.promoQuantity || ''} unid.) por Bs. ${product.promoPrice.toFixed(2)}`
      : product.unitPrice
      ? `Precio unitario: Bs. ${product.unitPrice.toFixed(2)}`
      : 'Precio a consultar';

  switch (intent) {
    case 'quiero_comprar':
      return `Hola Belén, ¡QUIERO COMPRAR! Producto: *${product.name}* (${priceLine}). ¿Cómo coordinamos la entrega y el pago?`;
    case 'consultar':
      return `Hola Belén, quiero consultar disponibilidad y detalles sobre *${product.name}* (${priceLine}).`;
    case 'mas_informacion':
      return `Hola Belén, necesito más información sobre *${product.name}* (características, formas de entrega y pago).`;
    case 'hacer_pedido':
      return `Hola Belén, quiero hacer mi pedido de *${product.name}* (${priceLine}).`;
    case 'soporte':
      return `Hola Belén, necesito soporte sobre el producto *${product.name}*.`;
    case 'hablar_belen':
    default:
      return `Hola Belén, te escribo desde el catálogo virtual por *${product.name}*.`;
  }
}

export function buildCartWhatsAppMessage(items: OrderItem[]): string {
  if (items.length === 0) {
    return 'Hola Belén, quiero hacer un pedido en BELÉN LA CASERITA BOLIVIA. ¿Me pasas disponibilidad?';
  }

  let total = 0;
  let hasUnpriced = false;

  const lines = items.map((item, idx) => {
    const isPromo = Boolean(
      item.usePromo && item.product.promoTitle && item.product.promoPrice
    );
    const unitOrPromoPrice = isPromo
      ? item.product.promoPrice || 0
      : item.product.unitPrice || 0;

    if (unitOrPromoPrice <= 0) {
      hasUnpriced = true;
    }

    const subtotal = unitOrPromoPrice * item.quantity;
    total += subtotal;

    const label = isPromo
      ? `${item.product.name} [${item.product.promoTitle}]`
      : item.product.name;

    const priceText =
      unitOrPromoPrice > 0 ? `Bs. ${subtotal.toFixed(2)}` : 'Precio a confirmar';

    return `${idx + 1}. ${item.quantity}x ${label} — ${priceText}`;
  });

  const totalLine = hasUnpriced
    ? `Total estimado (productos con precio): Bs. ${total.toFixed(2)}`
    : `Total estimado: Bs. ${total.toFixed(2)}`;

  return [
    'Hola Belén, quiero *HACER MI PEDIDO* desde el catálogo virtual:',
    '',
    ...lines,
    '',
    totalLine,
    'Por favor confírmame disponibilidad y coordinación de entrega.',
  ].join('\n');
}

export function generateSocialCopy(
  product: Product,
  settings: PublicSettings
): { whatsapp: string; facebook: string; tiktok: string } {
  const promo = calculatePromoSavings(product);
  const priceText = product.unitPrice
    ? `Bs. ${product.unitPrice.toFixed(2)}`
    : 'Consulta precio por interno';
  const promoText =
    promo && product.promoTitle
      ? `\n🔥 ${product.promoTitle}: Bs. ${promo.promoPrice.toFixed(2)} (¡Ahorras Bs. ${promo.savings.toFixed(2)} / -${promo.discountPercent}%!)`
      : '';

  const chars =
    product.characteristics.length > 0
      ? product.characteristics.map((c) => `• ${c}`).join('\n')
      : '';

  const waUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('quiero_comprar', product, Boolean(promo))
  );

  const whatsapp = [
    `*${product.name}* — ${settings.brandName}`,
    product.description,
    chars,
    `💰 Precio unitario: ${priceText}${promoText}`,
    `🚚 Entrega: ${product.deliveryInfo || settings.defaultDelivery}`,
    `📲 Haz tu pedido directo aquí: ${waUrl}`,
    `_${settings.slogan}_`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const facebook = [
    `✨ ${product.name} disponible en ${settings.brandName} 🇧🇴`,
    '',
    product.description,
    chars ? `\nDetalles:\n${chars}` : '',
    `\n💵 Precio: ${priceText}${promoText}`,
    `💳 Formas de pago: ${product.paymentInfo || settings.defaultPayment}`,
    `📦 Entregas: ${product.deliveryInfo || settings.defaultDelivery}`,
    '',
    `📲 Escríbenos directo al WhatsApp ${settings.whatsappNumber} o entra aquí: ${waUrl}`,
    `«${settings.slogan}»`,
  ]
    .filter(Boolean)
    .join('\n');

  const tiktok = [
    `${product.name} disponible hoy 🇧🇴✨`,
    promo && product.promoTitle
      ? `Aprovecha ${product.promoTitle} a Bs. ${promo.promoPrice.toFixed(2)} (ahorras ${promo.discountPercent}%).`
      : `Precio: ${priceText}.`,
    `Pedidos al WhatsApp ${settings.whatsappNumber} 📲`,
    `#BelenLaCaseritaBolivia #CatalogoBolivia #EmprendimientoBoliviano #DeTodoUnPoquito`,
  ].join('\n');

  return { whatsapp, facebook, tiktok };
}
