import React from 'react';
import { MessageCircle, Play, Video, X } from 'lucide-react';
import { Product, PublicSettings } from '../types';
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductVideoPlayer } from './ProductVideoPlayer';

interface ProductVideoSectionProps {
  product: Product;
  settings: PublicSettings;
  isExpanded: boolean;
  onToggle: () => void;
  playerMaxWidthClass?: string;
}

export function ProductVideoSection({
  product,
  settings,
  isExpanded,
  onToggle,
  playerMaxWidthClass = 'max-w-[260px]',
}: ProductVideoSectionProps) {
  const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim());
  const requestVideoUrl = buildWhatsAppUrl(
    settings,
    buildProductWhatsAppMessage('solicitar_video', product)
  );

  return (
    <div className="pt-2 border-t border-[#10245A]/10 space-y-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full min-h-[64px] px-4 py-3.5 rounded-2xl bg-[#CCFF00] hover:bg-[#D9FF38] active:translate-y-0.5 text-[#08153E] border-[3px] border-[#10245A] font-display font-black text-[15px] sm:text-base leading-tight flex items-center justify-center gap-3 transition-colors cursor-pointer animate-neon-video-vibrate"
      >
        <span className="w-9 h-9 rounded-xl bg-[#FF008C] text-white flex items-center justify-center shrink-0 border-2 border-[#10245A] shadow-xs">
          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
        </span>
        <span className="text-center">Ver cómo funciona el video de uso real</span>
      </button>

      {isExpanded && (
        <div className="p-3.5 rounded-2xl bg-[#FFF8E7] border-2 border-[#10245A]/15 space-y-3">
          {hasVideo ? (
            <ProductVideoPlayer
              videoUrl={product.videoUrl || ''}
              productName={product.name}
              maxWidthClass={playerMaxWidthClass}
            />
          ) : (
            <div className="p-4 rounded-xl bg-white border border-[#10245A]/12 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FF008C]/12 text-[#FF008C] flex items-center justify-center mx-auto">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-display font-bold text-sm text-[#10245A]">
                  Video de uso real disponible por pedido
                </p>
                <p className="text-xs text-[#10245A]/75 leading-relaxed">
                  Aún no subimos el video de este producto al catálogo, pero puedes pedirlo ahora mismo por WhatsApp.
                </p>
              </div>
              <a
                href={requestVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Solicitar video por WhatsApp</span>
              </a>
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-white hover:bg-[#10245A]/5 text-[#10245A] border border-[#10245A]/15 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cerrar video</span>
          </button>
        </div>
      )}
    </div>
  );
}
