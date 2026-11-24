import React from 'react';
import { X, Plus, Minus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { OrderItem, PublicSettings } from '../types';
import { buildCartWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductImage } from './ProductImage';

interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQty: (productId: string, usePromo: boolean, delta: number) => void;
  onRemoveItem: (productId: string, usePromo: boolean) => void;
  onClear: () => void;
  settings: PublicSettings;
}

export function OrderDrawer({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClear,
  settings,
}: OrderDrawerProps) {
  if (!open) return null;

  const totalAmount = items.reduce((sum, item) => {
    const unit =
      item.usePromo && item.product.promoPrice
        ? item.product.promoPrice
        : item.product.unitPrice || 0;
    return sum + unit * item.quantity;
  }, 0);

  const whatsappUrl = buildWhatsAppUrl(settings, buildCartWhatsAppMessage(items));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#10245A]/55 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mi pedido por WhatsApp"
    >
      <div
        className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#10245A]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#E6007E]" />
            <h2 className="font-display font-bold text-lg text-[#10245A]">
              Mi Pedido ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar pedido"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#FFF8E7] text-[#10245A] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#10245A]/25 mx-auto" />
              <p className="font-display font-bold text-base text-[#10245A]">
                Tu lista de pedido está vacía
              </p>
              <p className="text-sm text-[#10245A]/65 max-w-xs mx-auto">
                Agrega productos del catálogo o escribe directamente a Belén para consultar disponibilidad.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isPromo = Boolean(item.usePromo && item.product.promoPrice);
              const price = isPromo
                ? item.product.promoPrice || 0
                : item.product.unitPrice || 0;

              return (
                <div
                  key={`${item.product.id}-${item.usePromo ? 'promo' : 'unit'}`}
                  className="flex gap-3 pb-4 border-b border-[#10245A]/10"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FFF8E7] shrink-0">
                    <ProductImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-sm text-[#10245A] line-clamp-2">
                      {item.product.name}
                    </h3>
                    {isPromo && (
                      <p className="text-xs font-semibold text-[#E6007E]">
                        {item.product.promoTitle}
                      </p>
                    )}
                    <p className="text-sm font-bold text-[#00A83B] tabular-nums mt-0.5">
                      {price > 0 ? `Bs. ${(price * item.quantity).toFixed(2)}` : 'A consultar'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-[#FFF8E7] rounded-lg p-0.5 border border-[#10245A]/10">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.product.id, item.usePromo, -1)}
                          aria-label="Disminuir cantidad"
                          className="w-8 h-8 flex items-center justify-center text-[#10245A] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.product.id, item.usePromo, 1)}
                          aria-label="Aumentar cantidad"
                          className="w-8 h-8 flex items-center justify-center text-[#10245A] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id, item.usePromo)}
                        aria-label="Quitar producto"
                        className="w-9 h-9 flex items-center justify-center text-[#F04424] hover:bg-[#F04424]/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 border-t border-[#10245A]/10 bg-[#FFF8E7] space-y-3">
          {items.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#10245A]/75">
                Total estimado
              </span>
              <span className="font-display font-extrabold text-xl text-[#10245A] tabular-nums">
                Bs. {totalAmount.toFixed(2)}
              </span>
            </div>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>HACER MI PEDIDO POR WHATSAPP</span>
          </a>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="w-full min-h-[40px] text-xs font-semibold text-[#10245A]/65 hover:text-[#F04424] cursor-pointer"
            >
              Vaciar lista de pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
