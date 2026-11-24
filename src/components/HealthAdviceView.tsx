import React from 'react';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  ShieldAlert,
  CheckCircle2,
  Droplets,
  Moon,
  Activity,
  Sun,
  Wind,
  Apple,
  Scale,
  Sparkles,
} from 'lucide-react';
import { HealthTip, OFFICIAL_LOGO_PATH, PublicSettings } from '../types';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductImage } from './ProductImage';
import { AndeanBorder, BrandPaletteStrip } from './AndeanBorder';

interface HealthAdviceViewProps {
  healthTips: HealthTip[];
  settings: PublicSettings;
  onBackToCatalog: () => void;
  onOpenAdmin: () => void;
}

function getRemedyVisual(tip: HealthTip): {
  Icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  bgClass: string;
} {
  const key = `${tip.id} ${tip.title}`.toLowerCase();
  if (key.includes('agua')) {
    return {
      Icon: Droplets,
      accentClass: 'text-[#1746D2]',
      bgClass: 'bg-[#1746D2]/10',
    };
  }
  if (key.includes('descanso')) {
    return {
      Icon: Moon,
      accentClass: 'text-[#10245A]',
      bgClass: 'bg-[#10245A]/10',
    };
  }
  if (key.includes('ejercicio')) {
    return {
      Icon: Activity,
      accentClass: 'text-[#E6007E]',
      bgClass: 'bg-[#E6007E]/10',
    };
  }
  if (key.includes('solar') || key.includes('luz')) {
    return {
      Icon: Sun,
      accentClass: 'text-[#FF6A00]',
      bgClass: 'bg-[#FFD500]/25',
    };
  }
  if (key.includes('aire')) {
    return {
      Icon: Wind,
      accentClass: 'text-[#00A83B]',
      bgClass: 'bg-[#00A83B]/10',
    };
  }
  if (key.includes('nutri')) {
    return {
      Icon: Apple,
      accentClass: 'text-[#F04424]',
      bgClass: 'bg-[#F04424]/10',
    };
  }
  if (key.includes('temperancia') || key.includes('equilibrio')) {
    return {
      Icon: Scale,
      accentClass: 'text-[#1746D2]',
      bgClass: 'bg-[#B7E600]/25',
    };
  }
  return {
    Icon: Sparkles,
    accentClass: 'text-[#E6007E]',
    bgClass: 'bg-[#FFF8E7]',
  };
}

export function HealthAdviceView({
  healthTips,
  settings,
  onBackToCatalog,
  onOpenAdmin,
}: HealthAdviceViewProps) {
  return (
    <main className="pb-24 md:pb-12 bg-white">
      <section className="bg-[#FFF8E7] border-b border-[#10245A]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-[#FFD500]/30 text-[#10245A] border border-[#10245A]/15 text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al catálogo</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1746D2] border border-[#1746D2]/20 text-xs font-bold cursor-pointer transition-colors"
            >
              Editar imágenes o textos (Admin)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={OFFICIAL_LOGO_PATH}
              alt="BELÉN LA CASERITA BOLIVIA"
              className="w-20 h-20 object-contain shrink-0 bg-white rounded-2xl p-2 border border-[#10245A]/10"
            />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E6007E]">
                <Heart className="w-4 h-4 fill-[#E6007E]" />
                <span>{settings.brandName}</span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#10245A] text-balance">
                BELÉN TE CUIDA – PLUS DE SALUD Y BIENESTAR
              </h1>
              <p className="text-sm sm:text-base text-[#10245A]/80 max-w-2xl">
                Los <strong className="text-[#10245A]">8 Remedios Naturales</strong> para el cuidado cotidiano y el bienestar integral, visibles y desplegados para toda la familia.
              </p>
            </div>
          </div>

          <BrandPaletteStrip className="max-w-md" />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-6">
          {healthTips.map((tip) => {
            const visual = getRemedyVisual(tip);
            const RemedyIcon = visual.Icon;

            return (
              <article
                key={tip.id}
                className="rounded-3xl bg-white border border-[#10245A]/12 overflow-hidden shadow-xs"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  {/* Espacio de imagen 1:1 editable desde Administración */}
                  <div className="lg:col-span-4 p-5 bg-[#FFF8E7]/65 border-b lg:border-b-0 lg:border-r border-[#10245A]/10 flex items-center justify-center">
                    <div className="aspect-square w-full max-w-[260px] rounded-2xl overflow-hidden bg-white border border-[#10245A]/12 flex items-center justify-center">
                      {tip.imageUrl ? (
                        <ProductImage
                          src={tip.imageUrl}
                          alt={tip.title}
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex flex-col items-center justify-center p-5 text-center gap-3 ${visual.bgClass}`}
                        >
                          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                            <RemedyIcon className={`w-9 h-9 ${visual.accentClass}`} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-display font-bold text-sm text-[#10245A]">
                              {tip.title}
                            </p>
                            <p className="text-[11px] font-semibold text-[#10245A]/60">
                              Imagen 1:1 editable en Admin
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descripción textual completa siempre visible y desplegada */}
                  <div className="lg:col-span-8 p-6 sm:p-7 space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#00A83B]">
                        BELÉN TE CUIDA · Remedio Natural
                      </p>
                      <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#10245A]">
                        {tip.title}
                      </h2>
                    </div>

                    {tip.recommendation && (
                      <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/10 space-y-1">
                        <h3 className="font-display font-bold text-sm text-[#E6007E]">
                          Para qué y por qué es importante
                        </h3>
                        <p className="text-sm sm:text-base text-[#10245A] leading-relaxed">
                          {tip.recommendation}
                        </p>
                      </div>
                    )}

                    {tip.explanation && (
                      <div className="space-y-1.5">
                        <h3 className="font-display font-bold text-sm sm:text-base text-[#1746D2]">
                          Cómo mejora la salud y beneficios al practicarlo
                        </h3>
                        <p className="text-sm sm:text-base text-[#10245A]/85 leading-relaxed">
                          {tip.explanation}
                        </p>
                      </div>
                    )}

                    {tip.practicalTips.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-display font-bold text-sm text-[#10245A]">
                          Consejos prácticos
                        </h3>
                        <ul className="space-y-1.5 text-sm text-[#10245A]/85">
                          {tip.practicalTips.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#00A83B] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tip.precautions && (
                      <div className="p-4 rounded-2xl bg-[#F04424]/8 border border-[#F04424]/20 space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#F04424]">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>Precauciones</span>
                        </div>
                        <p className="text-sm text-[#10245A]/85 leading-relaxed">
                          {tip.precautions}
                        </p>
                      </div>
                    )}

                    <div className="pt-1">
                      <a
                        href={buildWhatsAppUrl(
                          settings,
                          `Hola, BELÉN LA CASERITA BOLIVIA. Leí sobre "${tip.title}" en BELÉN TE CUIDA y quiero hacer una consulta.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <span>HABLAR CON BELÉN POR WHATSAPP</span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Nota breve obligatoria al final de los 8 remedios naturales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/12 text-center">
          <p className="text-xs sm:text-sm font-medium text-[#10245A]/80 leading-relaxed">
            Estos contenidos orientan sobre hábitos de bienestar general y cuidado cotidiano; no sustituyen la evaluación ni el tratamiento de un profesional de salud.
          </p>
        </div>
      </section>

      <AndeanBorder className="mt-8" />
    </main>
  );
}
