import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface ProductTestimonial {
  author: string;
  city?: string;
  rating: number;
  quote: string;
  verifiedDate?: string;
  active: boolean;
}

interface Product {
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
  images: string[];
  videoUrl: string;
  deliveryInfo: string;
  paymentInfo: string;
  testimonials: ProductTestimonial[];
  active: boolean;
  isExample?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface HealthTip {
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

interface StoreSettings {
  brandName: string;
  slogan: string;
  whatsappNumber: string;
  whatsappCountryCode: string;
  supportTitle: string;
  supportText: string;
  defaultDelivery: string;
  defaultPayment: string;
  adminPin: string;
}

interface StoreData {
  settings: StoreSettings;
  products: Product[];
  healthTips: HealthTip[];
  visits: {
    totalVisits: number;
    dailyVisits: Record<string, number>;
  };
}

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function ensureDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function createInitialStore(): StoreData {
  const now = new Date().toISOString();
  return {
    settings: {
      brandName: 'BELÉN LA CASERITA BOLIVIA',
      slogan: 'De todo un poquito, siempre al mejor precio',
      whatsappNumber: '68048514',
      whatsappCountryCode: '591',
      supportTitle: 'BELÉN TE ATIENDE',
      supportText:
        '¿Te interesa alguno de nuestros productos? ¿Tienes dudas sobre precios, promociones o entregas? Escríbenos directamente. ¡Estamos para ayudarte!',
      defaultDelivery:
        'Entregas coordinadas por WhatsApp y envíos a todo el país previo acuerdo.',
      defaultPayment: 'Pago en efectivo al recibir, transferencia bancaria o código QR.',
      adminPin: process.env.ADMIN_PIN || '2026',
    },
    products: [
      {
        id: 'prod-alfombra-masajeadora-ems',
        name: 'Masajeador de Pies con Electrodos y Estimulación EMS',
        category: 'Cuidado Personal',
        description:
          'Alfombra o tapete masajeador de pies con tecnología EMS y módulo de control circular integrado. Formato plano, delgado, liviano y fácil de guardar, pensado para acompañarte en tus momentos de descanso en casa. Disponible por unidad (Bs. 125) o por mayor desde 3 unidades (Bs. 240 el lote).',
        characteristics: [
          'Tipo: Tapete / alfombra de electroestimulación EMS para pies con controlador circular acoplado',
          'Colores visibles: Base oscura (negro) con trazos claros (blanco/plateado) y módulo oscuro/azulado',
          'Componentes visibles: Tapete flexible con dos zonas para pies y unidad de control redonda',
          'Pendiente de confirmar con proveedor: marca/modelo, dimensiones, peso, materiales, alimentación (USB o pilas), modos, accesorios y garantía',
        ],
        benefits: [
          'Permite aplicar estimulación muscular de tipo EMS localizada en las plantas de los pies en formato plano',
          'Delgada, ligera y fácil de trasladar o guardar sin ocupar espacio como un aparato voluminoso',
          'Superficie conductora con esquema plantar y unidad de control circular integrada en el borde',
          'Pensada para momentos de descanso en casa (sensación variable según cada persona; sin promesas médicas)',
        ],
        usage:
          'Verifica que el tapete esté limpio y seco sobre una superficie plana y firme. Siéntate cómodamente, apoya ambos pies descalzos y limpios sobre las zonas marcadas, enciende el controlador y ajusta desde la intensidad mínima. Limpia con un paño suave ligeramente húmedo y seca bien antes de guardar.',
        wellnessTip:
          'Utilízalo con moderación y dentro de límites cómodos, iniciando siempre en el nivel más bajo. No lo uses sobre piel lastimada, irritada o muy húmeda. Si tienes dispositivos médicos implantados, problemas circulatorios, neuropatías o molestias persistentes, consulta antes con un profesional de salud.',
        unitPrice: 125,
        promoTitle: '',
        promoQuantity: null,
        promoPrice: null,
        wholesalePrice: 80,
        wholesaleMinQuantity: 3,
        imageUrl: '/assets/aistudio/images__10__59583c0c.jpeg',
        images: [
          '/assets/aistudio/images__10__59583c0c.jpeg',
          '/assets/aistudio/images__20__fe9f3de3.jpeg',
          '/assets/aistudio/images__21__18fea3c7.jpeg',
          '/assets/productos/antes_despues_ems_trabajo_1795548485176.jpg',
          '/assets/aistudio/1795547466313_bf8b9ab7.jpg',
          '/assets/aistudio/1795546558802_2f701ab0.jpg',
          '/assets/productos/formas_pago_belen_v2_1795548534996.jpg',
        ],
        videoUrl: '/assets/aistudio/_Te_duelen_los_pies..._pero_te_dijeron_que_era__normal___720P_HD__1_edf1e204.mp4',
        deliveryInfo:
          'Pendiente de confirmar cobertura, horarios, delivery y envíos nacionales por WhatsApp.',
        paymentInfo:
          'Pendiente de confirmar métodos habilitados (efectivo, transferencia bancaria o QR) por WhatsApp.',
        testimonials: [
          {
            author: 'Doña Elena',
            city: 'La Paz',
            rating: 5,
            quote:
              '¡La mejor inversión para mis pies! Después de un día largo de trabajo, usar este masajeador es como un alivio inmediato. Siento cómo se relaja toda la planta y alivia el cansancio acumulado. Al principio sentí un poco de cosquilleo, pero ahora lo disfruto mucho. ¡Mis pies se sienten como nuevos y puedo descansar mejor! Totalmente recomendado si buscas comodidad en casa.',
            verifiedDate: '2026-11-24',
            active: true,
          },
        ],
        active: true,
        isExample: false,
        views: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-pistola-masaje-muscular',
        name: 'Pistola de Masaje Muscular',
        category: 'Cuidado Personal',
        description:
          'Pistola de masaje muscular portátil con cabezales intercambiables y carga por USB, ideal para el bienestar diario en casa y la recuperación tras entrenamientos o jornadas largas. Incluye imágenes ilustrativas de experiencia y uso generadas con IA en el carrusel. Disponible por unidad (Bs. 199) o por mayor desde 3 unidades (Bs. 150 c/u).',
        characteristics: [
          'Incluye 4 cabezales intercambiables para adaptarse a cada grupo muscular (esférico, en U, cónico y plano)',
          'Carga práctica mediante cable USB incluido (conectable a cargador o puerto USB compatible)',
          'Tiempo de carga: aproximadamente 2 a 3 horas para volverlo a usar (ajustable según el lote en Admin)',
          'Tiempo de uso recomendado: sesiones de 10 a 15 minutos por zona muscular (ajustable según el lote en Admin)',
          'Experiencia y testimonio visual generados con IA disponibles en el carrusel 1:1 del producto',
        ],
        benefits: [
          'Ayuda a relajar los músculos tensos y cargados del día a día',
          'Contribuye a disminuir la rigidez muscular y la sensación de pesadez en el cuerpo',
          'Mejora la circulación sanguínea local en las zonas donde se aplica',
          'Alivia las molestias musculares después del ejercicio, entrenamiento o jornadas largas de pie o trabajo',
          'Permite masajear diferentes zonas del cuerpo con comodidad y control desde casa',
          'Incluye diferentes cabezales intercambiables para adaptarse a cada grupo muscular y brindar una experiencia más completa y personalizada',
          'Ideal para el bienestar diario en casa, cuidando tu cuerpo sin complicaciones',
        ],
        usage:
          '1. Revisa y elige el cabezal que mejor se adapte a la zona muscular que deseas trabajar. 2. Encájalo firmemente en la pistola de masaje muscular antes de encenderla. 3. Enciende el equipo y pásalo suavemente sobre la zona muscular, regulando la intensidad según tu comodidad. 4. Al terminar, apaga el dispositivo, retira o limpia el cabezal si es necesario y guárdalo en un lugar seguro. | Carga por USB: aprox. 2 a 3 horas (ajustable según lote en Admin). | Tiempo recomendado: sesiones de 10 a 15 minutos por zona muscular sin forzar un mismo punto por tiempos prolongados (ajustable en Admin).',
        wellnessTip:
          'Mantén una buena hidratación durante el día para acompañar la recuperación muscular, realiza estiramientos suaves antes y después de entrenar o pasar muchas horas en una misma postura y respeta tus horas de descanso. Precaución importante: evita aplicar la pistola de masaje muscular directamente sobre huesos prominentes, articulaciones sensibles, heridas abiertas, golpes fuertes o zonas con inflamación aguda; ante cualquier molestia persistente o condición médica previa, consulta con un profesional de salud.',
        unitPrice: 199,
        promoTitle: '',
        promoQuantity: null,
        promoPrice: null,
        wholesalePrice: 150,
        wholesaleMinQuantity: 3,
        imageUrl:
          '/assets/aistudio/masajeador-portatil-pistola-masaje-corporal-fascial-gun-mini_086a1eb3.jpg',
        images: [
          '/assets/aistudio/masajeador-portatil-pistola-masaje-corporal-fascial-gun-mini_086a1eb3.jpg',
          '/assets/aistudio/552fca8e44328658b04c340831a8811d_1200x1200_eb20c536.jpg',
          '/assets/productos/pistola_masaje_experiencia_1_1795550036347.jpg',
          '/assets/productos/pistola_masaje_antes_despues_1795550036903.jpg',
          '/assets/productos/pistola_masaje_pago_entrega_1795550036849.jpg',
        ],
        videoUrl: '',
        deliveryInfo:
          'Entrega a domicilio, envío a nivel nacional a toda Bolivia, delivery ágil y coordinado, o entrega en cualquier lugar coordinando directamente punto, horario y detalles con el cliente.',
        paymentInfo: 'Pago con QR rápido y práctico, pago en efectivo y transferencia bancaria.',
        testimonials: [],
        active: true,
        isExample: false,
        views: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ej-aguayo-andino',
        name: 'Aguayo Andino Tradicional Multicolor',
        category: 'Textiles y Artesanías',
        description:
          'Tejido rectangular con diseño de franjas y rombos geométricos en colores tradicionales andinos, ideal para uso cotidiano, decoración o regalo.',
        characteristics: [
          'Diseño geométrico multicolor en tejido firme',
          'Acabado doblado y bordes reforzados',
          'Artículo de ejemplo editable desde Administración',
        ],
        benefits: [
          'Práctico para múltiples usos en el hogar o salidas',
          'Colores vivos inspirados en la tradición boliviana',
        ],
        usage:
          'Úsalo como manta auxiliar, mantel decorativo para mesa, pieza tradicional o para transportar objetos livianos.',
        wellnessTip:
          'Ventilar el tejido después de cada uso y lavar con agua fría y jabón suave para conservar la viveza de sus hilos.',
        unitPrice: 85,
        promoTitle: 'Paquete Familiar x2',
        promoQuantity: 2,
        promoPrice: 150,
        wholesalePrice: 72,
        wholesaleMinQuantity: 3,
        imageUrl: '/src/assets/images/product_aguayo_andino_1795542362495.jpg',
        images: ['/src/assets/images/product_aguayo_andino_1795542362495.jpg'],
        videoUrl: '',
        deliveryInfo: 'Entrega coordinada por WhatsApp y envíos a departamentos.',
        paymentInfo: 'Efectivo contra entrega, transferencia bancaria o QR.',
        testimonials: [],
        active: true,
        isExample: true,
        views: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ej-chullo-andino',
        name: 'Chullo Tejido con Orejeras y Pompones',
        category: 'Ropa y Accesorios',
        description:
          'Gorro andino tejido con orejeras, borlas trenzadas y pompón superior multicolor. Cómodo y abrigado para clima frío.',
        characteristics: [
          'Orejeras con cordones trenzados y borlas',
          'Pompón superior multicolor',
          'Artículo de ejemplo editable desde Administración',
        ],
        benefits: [
          'Cubre cabeza y orejas frente al viento y el frío',
          'Diseño alegre y colorido fácil de combinar',
        ],
        usage:
          'Ideal para mañanas frías, viajes al altiplano o actividades al aire libre.',
        wellnessTip:
          'Mantener la cabeza y las orejas abrigadas en jornadas de viento ayuda a evitar cambios bruscos de temperatura.',
        unitPrice: 45,
        promoTitle: 'Combo Dúo Abrigo',
        promoQuantity: 2,
        promoPrice: 80,
        wholesalePrice: 38,
        wholesaleMinQuantity: 3,
        imageUrl: '/src/assets/images/product_chullo_tejido_1795542362938.jpg',
        images: ['/src/assets/images/product_chullo_tejido_1795542362938.jpg'],
        videoUrl: '',
        deliveryInfo: 'Entrega rápida coordinada por WhatsApp.',
        paymentInfo: 'Efectivo, transferencia bancaria o QR.',
        testimonials: [],
        active: true,
        isExample: true,
        views: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ej-miel-natural',
        name: 'Miel Natural en Frasco de Vidrio',
        category: 'Alimentos y Naturales',
        description:
          'Miel de abeja de tono dorado presentada en frasco de vidrio reutilizable con tapa rosca de madera.',
        characteristics: [
          'Envase de vidrio transparente con tapa de madera',
          'Textura fluida y color ámbar dorado',
          'Artículo de ejemplo editable desde Administración',
        ],
        benefits: [
          'Endulzante natural versátil para cocina y bebidas',
          'Presentación higiénica lista para servir',
        ],
        usage:
          'Agrega una cucharadita a infusiones tibias, desayunos, frutas, panes o recetas caseras.',
        wellnessTip:
          'Prefiere porciones moderadas y conserva el frasco bien cerrado en un lugar fresco y seco, lejos de la luz directa.',
        unitPrice: 55,
        promoTitle: 'Promo Despensa x3',
        promoQuantity: 3,
        promoPrice: 145,
        wholesalePrice: 46,
        wholesaleMinQuantity: 3,
        imageUrl: '/src/assets/images/product_miel_yungas_1795542362490.jpg',
        images: ['/src/assets/images/product_miel_yungas_1795542362490.jpg'],
        videoUrl: '',
        deliveryInfo: 'Entregas en punto acordado y servicio a domicilio.',
        paymentInfo: 'QR, transferencia o efectivo contra entrega.',
        testimonials: [],
        active: true,
        isExample: true,
        views: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ej-termo-acero',
        name: 'Termo Térmico Azul Marino 1 Litro',
        category: 'Hogar y Termos',
        description:
          'Botella térmica de acabado mate azul marino con asa superior ergonómica para llevar bebidas frías o calientes.',
        characteristics: [
          'Cuerpo metálico acabado mate color azul marino',
          'Tapa a rosca con asa integrada para transporte',
          'Artículo de ejemplo editable desde Administración',
        ],
        benefits: [
          'Fácil de llevar al trabajo, estudio o viajes',
          'Reduce el uso de botellas plásticas desechables',
        ],
        usage:
          'Ideal para transportar agua fresca, mates, café o infusiones durante toda la jornada.',
        wellnessTip:
          'Llevar tu propio termo facilita mantener una hidratación constante durante el día; recuerda enjuagarlo diariamente.',
        unitPrice: 95,
        promoTitle: 'Pack Oficina x2',
        promoQuantity: 2,
        promoPrice: 170,
        wholesalePrice: 82,
        wholesaleMinQuantity: 3,
        imageUrl: '/src/assets/images/product_termo_acero_1795542363002.jpg',
        images: ['/src/assets/images/product_termo_acero_1795542363002.jpg'],
        videoUrl: '',
        deliveryInfo: 'Envíos y entregas el mismo día según zona.',
        paymentInfo: 'Pago por QR, transferencia o efectivo.',
        testimonials: [],
        active: true,
        isExample: true,
        views: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    healthTips: createDefaultHealthTips(now),
    visits: {
      totalVisits: 0,
      dailyVisits: {},
    },
  };
}

function createDefaultHealthTips(now = new Date().toISOString()): HealthTip[] {
  return [
    {
      id: 'remedio-1-agua',
      title: '1. Agua',
      imageUrl: '/assets/remedios/remedio_agua_1795546232996.jpg',
      recommendation:
        'El agua es indispensable para el funcionamiento diario del organismo, ya que compone gran parte del cuerpo y participa en procesos vitales como la hidratación celular, la digestión, la circulación y la eliminación de desechos.',
      explanation:
        'Quien mantiene una buena hidratación diaria favorece una mejor digestión, apoya el trabajo de los riñones, ayuda a regular la temperatura corporal, reduce la sensación de cansancio asociada a la deshidratación leve y mantiene la piel y las mucosas en mejores condiciones.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'remedio-2-descanso',
      title: '2. Descanso',
      imageUrl: '/assets/remedios/remedio_descanso_1795546233833.jpg',
      recommendation:
        'El cuerpo necesita pausas y un sueño reparador para recuperarse del desgaste físico y mental acumulado durante la jornada.',
      explanation:
        'Descansar bien ayuda a restaurar la energía, favorece la concentración y la memoria, estabiliza el estado de ánimo, apoya el sistema inmunológico y permite enfrentar el día siguiente con mayor claridad y menor fatiga.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'remedio-3-ejercicio',
      title: '3. Ejercicio',
      imageUrl: '/assets/remedios/remedio_ejercicio_1795546233839.jpg',
      recommendation:
        'El movimiento físico regular mantiene activo el cuerpo y estimula sistemas clave que tienden a volverse lentos con el sedentarismo.',
      explanation:
        'Practicar actividad física acorde a la condición de cada persona mejora la circulación, fortalece músculos y huesos, cuida la salud cardiovascular y pulmonar, favorece la movilidad articular y ayuda a liberar tensión y estrés cotidiano.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'remedio-4-luz-solar',
      title: '4. Luz solar',
      imageUrl: '/assets/remedios/remedio_luz_solar_1795546233730.jpg',
      recommendation:
        'La luz natural es un regulador biológico clave que sincroniza los ritmos internos del cuerpo y participa en procesos metabólicos esenciales.',
      explanation:
        'Recibir luz solar de forma moderada y segura apoya la producción natural de vitamina D (importante para los huesos y el bienestar general), ayuda a regular el ciclo de sueño y vigilia y contribuye a una mejor estabilidad del ánimo.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'remedio-5-aire-puro',
      title: '5. Aire puro',
      imageUrl: '/assets/remedios/remedio_aire_puro_1795546250216.jpg',
      recommendation:
        'Respirar aire limpio y bien ventilado es necesario para oxigenar el organismo y mantener en buen estado las vías respiratorias.',
      explanation:
        'El contacto frecuente con aire fresco y entornos ventilados facilita una mejor oxigenación, ayuda a despejar la mente frente a ambientes cargados o cerrados y promueve una sensación de frescura y bienestar respiratorio.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'remedio-6-nutricion',
      title: '6. Nutrición',
      imageUrl: '/assets/remedios/remedio_nutricion_1795546250577.jpg',
      recommendation:
        'Los alimentos aportan los nutrientes básicos (vitaminas, minerales, fibra, proteínas, carbohidratos y grasas) que el cuerpo necesita para funcionar y repararse.',
      explanation:
        'Llevar una alimentación variada, natural y equilibrada proporciona energía sostenida, apoya las defensas naturales del organismo, mejora el tránsito intestinal y ayuda a cuidar la salud general a mediano y largo plazo.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'remedio-7-temperancia',
      title: '7. Temperancia (Equilibrio y moderación)',
      imageUrl: '/assets/remedios/remedio_temperancia_1795546251572.jpg',
      recommendation:
        'La temperancia consiste en practicar el equilibrio y la moderación en los hábitos diarios, evitando excesos y extremos perjudiciales.',
      explanation:
        'Quien cultiva la moderación en comidas, esfuerzos, pantallas y estimulantes protege su sistema digestivo y nervioso, evita sobrecargas innecesarias y logra hábitos saludables más estables y sostenibles en el tiempo.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'remedio-8-en-fe',
      title: '8. En fe',
      imageUrl: '/assets/remedios/remedio_en_fe_1795546251704.jpg',
      recommendation:
        'La fe, la esperanza y la vida espiritual o de propósito brindan un marco de sentido, serenidad y apoyo emocional frente a las dificultades.',
      explanation:
        'Cultivar la fe y momentos de reflexión, gratitud o oración ayuda a calmar la mente, fortalece la resiliencia emocional ante situaciones difíciles y fomenta el acompañamiento y el bienestar integral de la persona.',
      practicalTips: [],
      precautions: '',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

const DEFAULT_REMEDY_IMAGE_MAP: Record<string, string> = {
  'remedio-1-agua': '/assets/remedios/remedio_agua_1795546232996.jpg',
  'remedio-2-descanso': '/assets/remedios/remedio_descanso_1795546233833.jpg',
  'remedio-3-ejercicio': '/assets/remedios/remedio_ejercicio_1795546233839.jpg',
  'remedio-4-luz-solar': '/assets/remedios/remedio_luz_solar_1795546233730.jpg',
  'remedio-5-aire-puro': '/assets/remedios/remedio_aire_puro_1795546250216.jpg',
  'remedio-6-nutricion': '/assets/remedios/remedio_nutricion_1795546250577.jpg',
  'remedio-7-temperancia': '/assets/remedios/remedio_temperancia_1795546251572.jpg',
  'remedio-8-en-fe': '/assets/remedios/remedio_en_fe_1795546251704.jpg',
};

function readStore(): StoreData {
  ensureDirectories();
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoreData;
    parsed.products = (parsed.products || []).map((p) => {
      const normalizedImages: string[] = [];
      if (Array.isArray(p.images)) {
        for (const img of p.images) {
          const val = typeof img === 'string' ? img.trim() : '';
          if (val && !normalizedImages.includes(val)) {
            normalizedImages.push(val);
          }
        }
      }
      if (p.imageUrl && p.imageUrl.trim() && !normalizedImages.includes(p.imageUrl.trim())) {
        normalizedImages.unshift(p.imageUrl.trim());
      }
      return {
        ...p,
        images: normalizedImages,
        imageUrl: normalizedImages[0] || '',
        videoUrl: typeof p.videoUrl === 'string' ? p.videoUrl.trim() : '',
        testimonials: sanitizeTestimonials(p.testimonials),
        wholesalePrice: p.wholesalePrice ?? null,
        wholesaleMinQuantity: p.wholesaleMinQuantity >= 1 ? p.wholesaleMinQuantity : 3,
      };
    });
    parsed.healthTips =
      Array.isArray(parsed.healthTips) && parsed.healthTips.length > 0
        ? parsed.healthTips.map((tip) => ({
            ...tip,
            imageUrl:
              tip.imageUrl && tip.imageUrl.trim()
                ? tip.imageUrl
                : DEFAULT_REMEDY_IMAGE_MAP[tip.id] || '',
          }))
        : createDefaultHealthTips();
    return parsed;
  } catch {
    const fallback = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function writeStore(data: StoreData): void {
  ensureDirectories();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getPublicSettings(settings: StoreSettings) {
  const { adminPin: _hiddenPin, ...publicFields } = settings;
  return publicFields;
}

function getVisitStats(store: StoreData) {
  const todayDate = getTodayKey();
  const todayVisits = store.visits.dailyVisits[todayDate] || 0;
  const topProducts = [...store.products]
    .filter((p) => p.active)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      views: p.views || 0,
      imageUrl: p.imageUrl,
    }));

  return {
    totalVisits: store.visits.totalVisits || 0,
    todayVisits,
    todayDate,
    topProducts,
    storageNotice:
      'Visitas reales registradas en el servidor (almacenamiento local JSON). Para persistencia en la nube entre reinicios o múltiples servidores, conectar Firebase Firestore o Cloud SQL.',
  };
}

const activeSessions = new Set<string>();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || !activeSessions.has(token)) {
    res.status(401).json({
      error: 'Acceso restringido. Inicia sesión en Administración para continuar.',
    });
    return;
  }
  next();
}

function saveBase64ImageIfNeeded(imageInput: string): string {
  if (!imageInput) return '';
  if (!imageInput.startsWith('data:image/')) {
    return imageInput;
  }
  const match = imageInput.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
  if (!match) {
    return imageInput;
  }
  const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `prod_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  ensureDirectories();
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

function processProductImages(imagesInput: unknown, legacyImageUrl?: string): string[] {
  const result: string[] = [];
  if (Array.isArray(imagesInput)) {
    for (const item of imagesInput) {
      if (typeof item !== 'string') continue;
      const saved = saveBase64ImageIfNeeded(item.trim());
      if (saved && !result.includes(saved)) {
        result.push(saved);
      }
    }
  }
  if (result.length === 0 && legacyImageUrl && legacyImageUrl.trim()) {
    const saved = saveBase64ImageIfNeeded(legacyImageUrl.trim());
    if (saved) {
      result.push(saved);
    }
  }
  return result;
}

function sanitizeTestimonials(input: unknown): ProductTestimonial[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (t): t is Record<string, unknown> =>
        Boolean(t && typeof t === 'object' && String((t as Record<string, unknown>).author || '').trim() && String((t as Record<string, unknown>).quote || '').trim())
    )
    .map((t) => {
      const rawRating = Number(t.rating);
      const rating = Number.isFinite(rawRating)
        ? Math.min(5, Math.max(1, Math.round(rawRating)))
        : 5;
      return {
        author: String(t.author || '').trim(),
        city: String(t.city || '').trim(),
        rating,
        quote: String(t.quote || '').trim(),
        verifiedDate: String(t.verifiedDate || '').trim(),
        active: t.active !== false,
      };
    });
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  ensureDirectories();
  readStore();

  const app = express();

  // Video binary upload endpoint (9:16 product demonstration videos)
  app.post(
    '/api/admin/upload-video',
    requireAdmin,
    express.raw({ type: ['video/*', 'application/octet-stream'], limit: '60mb' }),
    (req, res) => {
      const buf = req.body as Buffer;
      if (!Buffer.isBuffer(buf) || buf.length === 0) {
        res.status(400).json({ error: 'Archivo de video vacío o inválido.' });
        return;
      }
      const contentType = String(req.headers['content-type'] || '').toLowerCase();
      let ext = 'mp4';
      if (contentType.includes('webm')) ext = 'webm';
      else if (contentType.includes('quicktime') || contentType.includes('mov')) ext = 'mov';
      else if (contentType.includes('ogg')) ext = 'ogv';

      const filename = `vid_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
      ensureDirectories();
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buf);
      res.json({ url: `/uploads/${filename}` });
    }
  );

  app.use(express.json({ limit: '50mb' }));

  // Serve uploaded product photos and videos
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public Catalog Endpoint (excludes adminPin, inactive products, and hidden testimonials)
  app.get('/api/catalog', (_req, res) => {
    const store = readStore();
    res.json({
      settings: getPublicSettings(store.settings),
      products: store.products
        .filter((p) => p.active)
        .map((p) => ({
          ...p,
          testimonials: (p.testimonials || []).filter((t) => t.active !== false),
        })),
      healthTips: store.healthTips.filter((h) => h.active),
      visitStats: getVisitStats(store),
    });
  });

  // Record a real visit
  app.post('/api/visits', (_req, res) => {
    const store = readStore();
    const todayKey = getTodayKey();
    store.visits.totalVisits = (store.visits.totalVisits || 0) + 1;
    store.visits.dailyVisits[todayKey] = (store.visits.dailyVisits[todayKey] || 0) + 1;
    writeStore(store);
    res.json({
      visitStats: getVisitStats(store),
    });
  });

  // Record a real product view
  app.post('/api/products/:id/view', (req, res) => {
    const store = readStore();
    const product = store.products.find((p) => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }
    product.views = (product.views || 0) + 1;
    writeStore(store);
    res.json({
      views: product.views,
      visitStats: getVisitStats(store),
    });
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { pin } = req.body as { pin?: string };
    const store = readStore();
    const expectedPin = store.settings.adminPin || '2026';
    const provided = String(pin || '');

    const bufA = Buffer.from(provided);
    const bufB = Buffer.from(expectedPin);
    const isMatch =
      bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

    if (!isMatch) {
      res.status(401).json({ error: 'Clave incorrecta. Intenta nuevamente.' });
      return;
    }

    const token = crypto.randomBytes(24).toString('hex');
    activeSessions.add(token);
    res.json({ token });
  });

  // Admin Logout
  app.post('/api/admin/logout', (req, res) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (token) activeSessions.delete(token);
    res.json({ ok: true });
  });

  // Admin Dashboard Data
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    const store = readStore();
    const entries = Object.entries(store.visits.dailyVisits)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({ date, count }));

    res.json({
      products: store.products,
      healthTips: store.healthTips,
      settings: getPublicSettings(store.settings),
      visitStats: getVisitStats(store),
      dailyHistory: entries,
    });
  });

  // Admin Create Product
  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const body = req.body as Partial<Product>;
    if (!body.name || !body.name.trim()) {
      res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
      return;
    }

    const store = readStore();
    const now = new Date().toISOString();
    const savedImages = processProductImages(body.images, body.imageUrl || '');
    const savedImageUrl = savedImages[0] || '';
    const savedVideoUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '';

    const newProduct: Product = {
      id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: body.name.trim(),
      category: (body.category || 'Varios').trim(),
      description: (body.description || '').trim(),
      characteristics: Array.isArray(body.characteristics)
        ? body.characteristics.map((c) => String(c).trim()).filter(Boolean)
        : [],
      benefits: Array.isArray(body.benefits)
        ? body.benefits.map((b) => String(b).trim()).filter(Boolean)
        : [],
      usage: (body.usage || '').trim(),
      wellnessTip: (body.wellnessTip || '').trim(),
      unitPrice:
        body.unitPrice !== null && body.unitPrice !== undefined && Number(body.unitPrice) > 0
          ? Number(body.unitPrice)
          : null,
      promoTitle: (body.promoTitle || '').trim(),
      promoQuantity:
        body.promoQuantity !== null &&
        body.promoQuantity !== undefined &&
        Number(body.promoQuantity) > 0
          ? Number(body.promoQuantity)
          : null,
      promoPrice:
        body.promoPrice !== null &&
        body.promoPrice !== undefined &&
        Number(body.promoPrice) > 0
          ? Number(body.promoPrice)
          : null,
      wholesalePrice:
        body.wholesalePrice !== null &&
        body.wholesalePrice !== undefined &&
        Number(body.wholesalePrice) > 0
          ? Number(body.wholesalePrice)
          : null,
      wholesaleMinQuantity:
        body.wholesaleMinQuantity !== null &&
        body.wholesaleMinQuantity !== undefined &&
        Number(body.wholesaleMinQuantity) >= 1
          ? Math.round(Number(body.wholesaleMinQuantity))
          : 3,
      imageUrl: savedImageUrl,
      images: savedImages,
      videoUrl: savedVideoUrl,
      deliveryInfo: (body.deliveryInfo || store.settings.defaultDelivery).trim(),
      paymentInfo: (body.paymentInfo || store.settings.defaultPayment).trim(),
      testimonials: sanitizeTestimonials(body.testimonials),
      active: body.active !== undefined ? Boolean(body.active) : true,
      isExample: false,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    store.products.unshift(newProduct);
    writeStore(store);
    res.status(201).json({ product: newProduct });
  });

  // Admin Update Product
  app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    const store = readStore();
    const idx = store.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }

    const existing = store.products[idx];
    const body = req.body as Partial<Product>;
    const savedImages =
      body.images !== undefined
        ? processProductImages(body.images, body.imageUrl)
        : body.imageUrl !== undefined
        ? processProductImages([body.imageUrl])
        : existing.images;
    const savedImageUrl = savedImages[0] || '';
    const savedVideoUrl =
      body.videoUrl !== undefined ? String(body.videoUrl || '').trim() : existing.videoUrl || '';

    const updated: Product = {
      ...existing,
      name: body.name !== undefined ? body.name.trim() : existing.name,
      category: body.category !== undefined ? body.category.trim() : existing.category,
      description:
        body.description !== undefined ? body.description.trim() : existing.description,
      characteristics:
        body.characteristics !== undefined
          ? body.characteristics.map((c) => String(c).trim()).filter(Boolean)
          : existing.characteristics,
      benefits:
        body.benefits !== undefined
          ? body.benefits.map((b) => String(b).trim()).filter(Boolean)
          : existing.benefits,
      usage: body.usage !== undefined ? body.usage.trim() : existing.usage,
      wellnessTip:
        body.wellnessTip !== undefined ? body.wellnessTip.trim() : existing.wellnessTip,
      unitPrice:
        body.unitPrice !== undefined
          ? body.unitPrice !== null && Number(body.unitPrice) > 0
            ? Number(body.unitPrice)
            : null
          : existing.unitPrice,
      promoTitle:
        body.promoTitle !== undefined ? body.promoTitle.trim() : existing.promoTitle,
      promoQuantity:
        body.promoQuantity !== undefined
          ? body.promoQuantity !== null && Number(body.promoQuantity) > 0
            ? Number(body.promoQuantity)
            : null
          : existing.promoQuantity,
      promoPrice:
        body.promoPrice !== undefined
          ? body.promoPrice !== null && Number(body.promoPrice) > 0
            ? Number(body.promoPrice)
            : null
          : existing.promoPrice,
      wholesalePrice:
        body.wholesalePrice !== undefined
          ? body.wholesalePrice !== null && Number(body.wholesalePrice) > 0
            ? Number(body.wholesalePrice)
            : null
          : existing.wholesalePrice,
      wholesaleMinQuantity:
        body.wholesaleMinQuantity !== undefined &&
        body.wholesaleMinQuantity !== null &&
        Number(body.wholesaleMinQuantity) >= 1
          ? Math.round(Number(body.wholesaleMinQuantity))
          : existing.wholesaleMinQuantity || 3,
      imageUrl: savedImageUrl,
      images: savedImages,
      videoUrl: savedVideoUrl,
      deliveryInfo:
        body.deliveryInfo !== undefined ? body.deliveryInfo.trim() : existing.deliveryInfo,
      paymentInfo:
        body.paymentInfo !== undefined ? body.paymentInfo.trim() : existing.paymentInfo,
      testimonials:
        body.testimonials !== undefined
          ? sanitizeTestimonials(body.testimonials)
          : existing.testimonials,
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
      isExample: false,
      updatedAt: new Date().toISOString(),
    };

    store.products[idx] = updated;
    writeStore(store);
    res.json({ product: updated });
  });

  // Admin Delete Product
  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const store = readStore();
    const initialLen = store.products.length;
    store.products = store.products.filter((p) => p.id !== req.params.id);
    if (store.products.length === initialLen) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }
    writeStore(store);
    res.json({ ok: true });
  });

  // Admin Create Health Tip (BELÉN TE CUIDA – PLUS DE SALUD Y BIENESTAR)
  app.post('/api/admin/health-tips', requireAdmin, (req, res) => {
    const body = req.body as Partial<HealthTip>;
    if (!body.title || !body.title.trim()) {
      res.status(400).json({ error: 'El título del consejo es obligatorio.' });
      return;
    }

    const store = readStore();
    const now = new Date().toISOString();
    const savedImageUrl = saveBase64ImageIfNeeded(body.imageUrl || '');

    const tip: HealthTip = {
      id: `tip-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      title: body.title.trim(),
      imageUrl: savedImageUrl,
      recommendation: (body.recommendation || '').trim(),
      explanation: (body.explanation || '').trim(),
      practicalTips: Array.isArray(body.practicalTips)
        ? body.practicalTips.map((t) => String(t).trim()).filter(Boolean)
        : [],
      precautions: (body.precautions || '').trim(),
      active: body.active !== undefined ? Boolean(body.active) : true,
      createdAt: now,
      updatedAt: now,
    };

    store.healthTips.unshift(tip);
    writeStore(store);
    res.status(201).json({ healthTip: tip });
  });

  // Admin Update Health Tip
  app.put('/api/admin/health-tips/:id', requireAdmin, (req, res) => {
    const store = readStore();
    const idx = store.healthTips.findIndex((h) => h.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Consejo de salud no encontrado.' });
      return;
    }

    const existing = store.healthTips[idx];
    const body = req.body as Partial<HealthTip>;
    const savedImageUrl =
      body.imageUrl !== undefined
        ? saveBase64ImageIfNeeded(body.imageUrl)
        : existing.imageUrl;

    const updated: HealthTip = {
      ...existing,
      title: body.title !== undefined ? body.title.trim() : existing.title,
      imageUrl: savedImageUrl,
      recommendation:
        body.recommendation !== undefined ? body.recommendation.trim() : existing.recommendation,
      explanation:
        body.explanation !== undefined ? body.explanation.trim() : existing.explanation,
      practicalTips:
        body.practicalTips !== undefined
          ? body.practicalTips.map((t) => String(t).trim()).filter(Boolean)
          : existing.practicalTips,
      precautions:
        body.precautions !== undefined ? body.precautions.trim() : existing.precautions,
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
      updatedAt: new Date().toISOString(),
    };

    store.healthTips[idx] = updated;
    writeStore(store);
    res.json({ healthTip: updated });
  });

  // Admin Delete Health Tip
  app.delete('/api/admin/health-tips/:id', requireAdmin, (req, res) => {
    const store = readStore();
    const initialLen = store.healthTips.length;
    store.healthTips = store.healthTips.filter((h) => h.id !== req.params.id);
    if (store.healthTips.length === initialLen) {
      res.status(404).json({ error: 'Consejo de salud no encontrado.' });
      return;
    }
    writeStore(store);
    res.json({ ok: true });
  });

  // Admin Update Settings
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const store = readStore();
    const body = req.body as Partial<StoreSettings> & { newPin?: string };

    if (body.whatsappNumber !== undefined) {
      const cleaned = body.whatsappNumber.replace(/\D/g, '');
      if (cleaned.length < 7) {
        res.status(400).json({ error: 'Ingresa un número de WhatsApp válido.' });
        return;
      }
      store.settings.whatsappNumber = cleaned;
    }
    if (body.whatsappCountryCode !== undefined) {
      store.settings.whatsappCountryCode =
        body.whatsappCountryCode.replace(/\D/g, '') || '591';
    }
    if (body.supportTitle !== undefined) {
      store.settings.supportTitle = body.supportTitle.trim() || 'BELÉN TE ATIENDE';
    }
    if (body.supportText !== undefined) {
      store.settings.supportText = body.supportText.trim();
    }
    if (body.defaultDelivery !== undefined) {
      store.settings.defaultDelivery = body.defaultDelivery.trim();
    }
    if (body.defaultPayment !== undefined) {
      store.settings.defaultPayment = body.defaultPayment.trim();
    }
    if (body.newPin && body.newPin.trim().length >= 4) {
      store.settings.adminPin = body.newPin.trim();
    }

    writeStore(store);
    res.json({ settings: getPublicSettings(store.settings) });
  });

  // Server-side Gemini Vision Analysis for uploaded product photos
  app.post('/api/admin/analyze-product', requireAdmin, async (req, res) => {
    const { imageBase64, mimeType } = req.body as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!imageBase64) {
      res.status(400).json({ error: 'Debes subir una fotografía del producto primero.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY no está configurada en el servidor. Configúrala en Settings > Secrets o completa los campos manualmente.',
      });
      return;
    }

    try {
      const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      const prompt = `Analiza únicamente lo que se observa visualmente en esta fotografía de producto para el catálogo de "BELÉN LA CASERITA BOLIVIA".
REGLAS ESTRICTAS:
1. Responde completamente en español claro y comercial.
2. Describe SOLO lo que es visible en la imagen (forma, colores, material aparente, presentación, tipo de envase o textura).
3. PROHIBIDO inventar precios, promociones, testimonios, garantías, condiciones de entrega, marca si no se lee claramente en la foto, o beneficios médicos/curativos.
4. Si un dato no es visible en la foto, no lo supongas ni lo agregues.
5. Para la categoría, elige la más cercana entre: "Textiles y Artesanías", "Alimentos y Naturales", "Hogar y Termos", "Ropa y Accesorios", "Cuidado Personal", "Varios".`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedName: {
                type: Type.STRING,
                description: 'Nombre descriptivo breve basado únicamente en lo que se ve en la foto.',
              },
              suggestedCategory: {
                type: Type.STRING,
                description: 'Una de las categorías válidas del catálogo.',
              },
              visualDescription: {
                type: Type.STRING,
                description: 'Descripción neutral y fiel de 1 a 2 oraciones sobre lo observado.',
              },
              observableCharacteristics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de 3 a 5 características físicas directamente visibles en la fotografía.',
              },
              suggestedUsage: {
                type: Type.STRING,
                description: 'Uso cotidiano evidente del tipo de artículo mostrado, sin afirmaciones médicas.',
              },
              cautionNote: {
                type: Type.STRING,
                description: 'Recordatorio breve en español indicando qué datos debe completar o verificar el administrador (precio, medidas exactas, entrega).',
              },
            },
          },
        },
      });

      const text = (response.text ?? '{}').trim();
      const parsed = JSON.parse(text);
      res.json({ analysis: parsed });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al analizar la imagen con IA.';
      res.status(500).json({
        error: `No se pudo completar el análisis con Gemini: ${message}`,
      });
    }
  });

  // Vite middleware in dev / static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BELÉN LA CASERITA BOLIVIA server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
