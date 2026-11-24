import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HealthTip, OrderItem, Product, PublicSettings, VisitStats } from './types';
import { AppView, Header } from './components/Header';
import { Storefront } from './components/Storefront';
import { ProductModal } from './components/ProductModal';
import { OrderDrawer } from './components/OrderDrawer';
import { AdminPanel } from './components/AdminPanel';
import { HealthAdviceView } from './components/HealthAdviceView';

const DEFAULT_SETTINGS: PublicSettings = {
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
};

const DEFAULT_VISIT_STATS: VisitStats = {
  totalVisits: 0,
  todayVisits: 0,
  todayDate: '',
  topProducts: [],
  storageNotice: '',
};

export default function App() {
  const [view, setView] = useState<AppView | 'health'>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);
  const [visitStats, setVisitStats] = useState<VisitStats>(DEFAULT_VISIT_STATS);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const visitRecordedRef = useRef(false);

  const loadCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (!res.ok) throw new Error('No se pudo cargar el catálogo.');
      const data = await res.json();
      setProducts(data.products || []);
      setHealthTips(data.healthTips || []);
      if (data.settings) setSettings(data.settings);
      if (data.visitStats) setVisitStats(data.visitStats);
      setLoadError('');
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Error al conectar con el catálogo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog().then(() => {
      if (!visitRecordedRef.current) {
        visitRecordedRef.current = true;
        fetch('/api/visits', { method: 'POST' })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.visitStats) {
              setVisitStats(data.visitStats);
            }
          })
          .catch(() => {});
      }
    });
  }, [loadCatalog]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    fetch(`/api/products/${product.id}/view`, { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.visitStats) {
          setVisitStats(data.visitStats);
        }
      })
      .catch(() => {});
  };

  const handleAddToOrder = (product: Product, usePromo: boolean) => {
    setOrderItems((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.usePromo === usePromo
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1, usePromo }];
    });
  };

  const handleUpdateQty = (productId: string, usePromo: boolean, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.usePromo === usePromo) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string, usePromo: boolean) => {
    setOrderItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.usePromo === usePromo)
      )
    );
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const cartCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-[#10245A]">
      <Header
        currentView={view === 'admin' ? 'admin' : 'catalog'}
        onNavigateView={setView}
        onScrollToSection={scrollToSection}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        brandName={settings.brandName}
      />

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center space-y-3">
          <p className="font-display font-bold text-lg text-[#10245A]">
            Cargando catálogo de {settings.brandName}...
          </p>
        </div>
      ) : loadError ? (
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <p className="font-display font-bold text-lg text-[#F04424]">{loadError}</p>
          <button
            type="button"
            onClick={loadCatalog}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1746D2] text-white font-bold text-sm cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : view === 'admin' ? (
        <AdminPanel
          onCatalogUpdated={loadCatalog}
          onExitAdmin={() => setView('catalog')}
        />
      ) : view === 'health' ? (
        <HealthAdviceView
          healthTips={healthTips}
          settings={settings}
          onBackToCatalog={() => {
            setView('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAdmin={() => setView('admin')}
        />
      ) : (
        <Storefront
          products={products}
          settings={settings}
          visitStats={visitStats}
          onSelectProduct={handleSelectProduct}
          onAddToOrder={handleAddToOrder}
          onOpenAdmin={() => setView('admin')}
          onOpenHealthAdvice={() => {
            setView('health');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <ProductModal
        product={selectedProduct}
        settings={settings}
        onClose={() => setSelectedProduct(null)}
        onAddToOrder={handleAddToOrder}
      />

      <OrderDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={orderItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClear={() => setOrderItems([])}
        settings={settings}
      />
    </div>
  );
}
