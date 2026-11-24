import React from 'react';
import { ShoppingBag, MessageCircle, ShieldCheck, LayoutGrid } from 'lucide-react';
import { AndeanBorder } from './AndeanBorder';

export type AppView = 'catalog' | 'admin';

interface HeaderProps {
  currentView: AppView;
  onNavigateView: (view: AppView) => void;
  onScrollToSection: (sectionId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  brandName: string;
}

export function Header({
  currentView,
  onNavigateView,
  onScrollToSection,
  cartCount,
  onOpenCart,
  brandName,
}: HeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#10245A]/10">
        <AndeanBorder />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              onNavigateView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display font-extrabold text-sm sm:text-lg tracking-tight text-[#10245A] whitespace-nowrap shrink-0 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1746D2] rounded"
          >
            {brandName}
          </button>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#10245A]/75"
          >
            <button
              type="button"
              onClick={() => {
                onNavigateView('catalog');
                setTimeout(() => onScrollToSection('catalogo-productos'), 40);
              }}
              className={`hover:text-[#E6007E] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                currentView === 'catalog' ? 'text-[#10245A] underline underline-offset-4 decoration-[#E6007E] decoration-2' : ''
              }`}
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateView('catalog');
                setTimeout(() => onScrollToSection('seccion-promociones'), 40);
              }}
              className="hover:text-[#E6007E] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Promociones
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateView('catalog');
                setTimeout(() => onScrollToSection('belen-te-atiende'), 40);
              }}
              className="hover:text-[#E6007E] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Soporte
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('admin')}
              className={`hover:text-[#1746D2] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                currentView === 'admin' ? 'text-[#1746D2] underline underline-offset-4 decoration-2' : ''
              }`}
            >
              Administración
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="min-h-[40px] sm:min-h-[44px] px-4 py-2 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>HACER MI PEDIDO</span>
              {cartCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded bg-[#FFD500] text-[#10245A] text-xs font-extrabold tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Android Thumb-Zone Bottom Navigation (compact <= 56px) */}
      <nav
        aria-label="Menú móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#10245A]/12 pb-safe"
      >
        <div className="grid grid-cols-4 h-14">
          <button
            type="button"
            onClick={() => {
              onNavigateView('catalog');
              setTimeout(() => onScrollToSection('catalogo-productos'), 40);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
              currentView === 'catalog' ? 'text-[#E6007E]' : 'text-[#10245A]/70'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateView('catalog');
              setTimeout(() => onScrollToSection('belen-te-atiende'), 40);
            }}
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-[#10245A]/70"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Soporte</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-[#00A83B] relative"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>
              Pedido{cartCount > 0 ? ` (${cartCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView('admin')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
              currentView === 'admin' ? 'text-[#1746D2]' : 'text-[#10245A]/70'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Admin</span>
          </button>
        </div>
      </nav>
    </>
  );
}
