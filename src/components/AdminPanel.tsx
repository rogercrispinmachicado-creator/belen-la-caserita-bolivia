import React, { useEffect, useState } from 'react';
import {
  Lock,
  Plus,
  Sparkles,
  Upload,
  Trash2,
  Edit3,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Save,
  Download,
  AlertCircle,
  CheckCircle2,
  Heart,
  Video,
  Link2,
  Star,
  Copy,
} from 'lucide-react';
import {
  AdminDashboardData,
  AIAnalysisResult,
  HealthTip,
  OFFICIAL_PALETTE,
  PRODUCT_CATEGORIES,
  Product,
  ProductTestimonial,
  calculatePromoSavings,
  calculateWholesaleSavings,
  getProductImages,
} from '../types';
import { SlideGenerator } from './SlideGenerator';
import { ProductImage } from './ProductImage';
import { ProductCarousel } from './ProductCarousel';
import { ProductVideoPlayer } from './ProductVideoPlayer';

interface AdminPanelProps {
  onCatalogUpdated: () => void;
  onExitAdmin: () => void;
}

type AdminTab = 'products' | 'slides' | 'health' | 'stats' | 'settings';

interface ProductFormState {
  id?: string;
  name: string;
  category: string;
  description: string;
  characteristicsText: string;
  benefitsText: string;
  usage: string;
  wellnessTip: string;
  unitPrice: string;
  promoTitle: string;
  promoQuantity: string;
  promoPrice: string;
  wholesalePrice: string;
  wholesaleMinQuantity: string;
  images: string[];
  videoUrl: string;
  deliveryInfo: string;
  paymentInfo: string;
  testimonials: ProductTestimonial[];
  active: boolean;
}

interface HealthTipFormState {
  id?: string;
  title: string;
  imageUrl: string;
  recommendation: string;
  explanation: string;
  practicalTipsText: string;
  precautions: string;
  active: boolean;
}

function emptyHealthForm(): HealthTipFormState {
  return {
    title: '',
    imageUrl: '',
    recommendation: '',
    explanation: '',
    practicalTipsText: '',
    precautions: '',
    active: true,
  };
}

function emptyForm(defaultDelivery = '', defaultPayment = ''): ProductFormState {
  return {
    name: '',
    category: 'Varios',
    description: '',
    characteristicsText: '',
    benefitsText: '',
    usage: '',
    wellnessTip: '',
    unitPrice: '',
    promoTitle: '',
    promoQuantity: '',
    promoPrice: '',
    wholesalePrice: '',
    wholesaleMinQuantity: '3',
    images: [],
    videoUrl: '',
    deliveryInfo: defaultDelivery,
    paymentInfo: defaultPayment,
    testimonials: [],
    active: true,
  };
}

function productToForm(p: Product): ProductFormState {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    characteristicsText: p.characteristics.join('\n'),
    benefitsText: p.benefits.join('\n'),
    usage: p.usage,
    wellnessTip: p.wellnessTip,
    unitPrice: p.unitPrice !== null ? String(p.unitPrice) : '',
    promoTitle: p.promoTitle,
    promoQuantity: p.promoQuantity !== null ? String(p.promoQuantity) : '',
    promoPrice: p.promoPrice !== null ? String(p.promoPrice) : '',
    wholesalePrice: p.wholesalePrice !== null && p.wholesalePrice !== undefined ? String(p.wholesalePrice) : '',
    wholesaleMinQuantity: String(p.wholesaleMinQuantity >= 1 ? p.wholesaleMinQuantity : 3),
    images: getProductImages(p),
    videoUrl: p.videoUrl || '',
    deliveryInfo: p.deliveryInfo,
    paymentInfo: p.paymentInfo,
    testimonials: (p.testimonials || []).map((t) => ({
      author: t.author || '',
      city: t.city || '',
      rating: Number(t.rating) >= 3 && Number(t.rating) <= 5 ? Math.round(Number(t.rating)) : 5,
      quote: t.quote || '',
      verifiedDate: t.verifiedDate || '',
      active: t.active !== false,
    })),
    active: p.active,
  };
}

async function compressImageFile(file: File): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Archivo de imagen inválido.'));
      img.onload = () => {
        const maxDim = 1280;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: String(reader.result), mimeType: file.type || 'image/jpeg' });
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const mime = 'image/jpeg';
        resolve({ dataUrl: canvas.toDataURL(mime, 0.86), mimeType: mime });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function AdminPanel({ onCatalogUpdated, onExitAdmin }: AdminPanelProps) {
  const [token, setToken] = useState<string>(() =>
    sessionStorage.getItem('belen_admin_token') || ''
  );
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<AdminTab>('products');
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [slideProductId, setSlideProductId] = useState<string | undefined>(undefined);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(() => emptyForm());
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Settings form state
  const [waNumber, setWaNumber] = useState('');
  const [waCountryCode, setWaCountryCode] = useState('591');
  const [supportTitle, setSupportTitle] = useState('');
  const [supportText, setSupportText] = useState('');
  const [defaultDelivery, setDefaultDelivery] = useState('');
  const [defaultPayment, setDefaultPayment] = useState('');
  const [newPin, setNewPin] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Health tips form state
  const [healthFormOpen, setHealthFormOpen] = useState(false);
  const [healthForm, setHealthForm] = useState<HealthTipFormState>(() => emptyHealthForm());
  const [savingHealthTip, setSavingHealthTip] = useState(false);

  const fetchDashboard = async (authToken: string) => {
    setLoadingDash(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem('belen_admin_token');
        setToken('');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar el panel.');
      const data = (await res.json()) as AdminDashboardData;
      setDashboard(data);
      setWaNumber(data.settings.whatsappNumber);
      setWaCountryCode(data.settings.whatsappCountryCode);
      setSupportTitle(data.settings.supportTitle);
      setSupportText(data.settings.supportText);
      setDefaultDelivery(data.settings.defaultDelivery);
      setDefaultPayment(data.settings.defaultPayment);
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Error al cargar datos.',
      });
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Clave incorrecta.');
        return;
      }
      sessionStorage.setItem('belen_admin_token', data.token);
      setToken(data.token);
      setPinInput('');
    } catch {
      setAuthError('No se pudo conectar con el servidor.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem('belen_admin_token');
    setToken('');
    setDashboard(null);
    onExitAdmin();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    try {
      const files = Array.from(fileList);
      const uploadedDataUrls: string[] = [];
      for (const file of files) {
        const { dataUrl } = await compressImageFile(file);
        uploadedDataUrls.push(dataUrl);
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedDataUrls],
      }));
      setAiNote('');
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'No se pudo procesar la foto.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrlInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      images: prev.images.includes(trimmed) ? prev.images : [...prev.images, trimmed],
    }));
    setNewImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMakePrimaryImage = (index: number) => {
    if (index === 0) return;
    setForm((prev) => {
      const next = [...prev.images];
      const [selected] = next.splice(index, 1);
      if (selected) next.unshift(selected);
      return { ...prev, images: next };
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/upload-video', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type || 'video/mp4',
        },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'No se pudo subir el video.' });
        return;
      }
      setForm((prev) => ({ ...prev, videoUrl: data.url }));
      setFeedback({ type: 'ok', text: 'Video vertical (9:16) cargado correctamente.' });
    } catch {
      setFeedback({ type: 'err', text: 'Error al subir el archivo de video.' });
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleAnalyzeWithAI = async () => {
    const primaryImage = form.images[0];
    if (!primaryImage) {
      setFeedback({
        type: 'err',
        text: 'Sube primero al menos una fotografía del producto para analizarla con IA.',
      });
      return;
    }
    setAnalyzingAI(true);
    setFeedback(null);
    setAiNote('');

    try {
      let imageBase64 = primaryImage;
      let mimeType = 'image/jpeg';

      if (!imageBase64.startsWith('data:')) {
        const imgResp = await fetch(imageBase64);
        const blob = await imgResp.blob();
        mimeType = blob.type || 'image/jpeg';
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/admin/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'No se pudo analizar la foto.' });
        return;
      }

      const analysis = data.analysis as AIAnalysisResult;
      setForm((prev) => ({
        ...prev,
        name: analysis.suggestedName || prev.name,
        category: analysis.suggestedCategory || prev.category,
        description: analysis.visualDescription || prev.description,
        characteristicsText:
          analysis.observableCharacteristics?.length > 0
            ? analysis.observableCharacteristics.join('\n')
            : prev.characteristicsText,
        usage: analysis.suggestedUsage || prev.usage,
      }));
      setAiNote(
        analysis.cautionNote ||
          'Borrador generado a partir de lo visible en la foto. Revisa, corrige y completa precios y condiciones reales antes de guardar.'
      );
    } catch {
      setFeedback({
        type: 'err',
        text: 'Error de conexión al analizar la imagen con IA.',
      });
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFeedback({ type: 'err', text: 'El nombre del producto es obligatorio.' });
      return;
    }

    setSavingProduct(true);
    setFeedback(null);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      characteristics: form.characteristicsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      benefits: form.benefitsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      usage: form.usage.trim(),
      wellnessTip: form.wellnessTip.trim(),
      unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
      promoTitle: form.promoTitle.trim(),
      promoQuantity: form.promoQuantity ? Number(form.promoQuantity) : null,
      promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
      wholesalePrice: form.wholesalePrice ? Number(form.wholesalePrice) : null,
      wholesaleMinQuantity: form.wholesaleMinQuantity ? Number(form.wholesaleMinQuantity) : 3,
      images: form.images,
      imageUrl: form.images[0] || '',
      videoUrl: form.videoUrl.trim(),
      deliveryInfo: form.deliveryInfo.trim(),
      paymentInfo: form.paymentInfo.trim(),
      testimonials: form.testimonials
        .filter((t) => t.author.trim() && t.quote.trim())
        .map((t) => ({
          author: t.author.trim(),
          city: (t.city || '').trim(),
          rating: Number(t.rating) >= 3 && Number(t.rating) <= 5 ? Math.round(Number(t.rating)) : 5,
          quote: t.quote.trim(),
          verifiedDate: (t.verifiedDate || '').trim(),
          active: t.active !== false,
        })),
      active: form.active,
    };

    try {
      const url = form.id
        ? `/api/admin/products/${form.id}`
        : '/api/admin/products';
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Error al guardar producto.' });
        return;
      }
      setFormOpen(false);
      await fetchDashboard(token);
      onCatalogUpdated();
      setFeedback({
        type: 'ok',
        text: form.id
          ? 'Producto actualizado en el catálogo.'
          : 'Producto agregado al catálogo.',
      });
    } catch {
      setFeedback({ type: 'err', text: 'Error de red al guardar el producto.' });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchDashboard(token);
      onCatalogUpdated();
      setFeedback({ type: 'ok', text: `Producto "${name}" eliminado.` });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          whatsappNumber: waNumber,
          whatsappCountryCode: waCountryCode,
          supportTitle,
          supportText,
          defaultDelivery,
          defaultPayment,
          ...(newPin.trim() ? { newPin: newPin.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'No se pudo actualizar.' });
        return;
      }
      setNewPin('');
      await fetchDashboard(token);
      onCatalogUpdated();
      setFeedback({ type: 'ok', text: 'Configuración de contacto actualizada.' });
    } catch {
      setFeedback({ type: 'err', text: 'Error al guardar configuración.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDownloadPaletteSvg = async () => {
    const res = await fetch('/assets/aistudio/ai_studio_code_6f105bb8.txt');
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paleta-belen.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHealthPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await compressImageFile(file);
      setHealthForm((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'No se pudo procesar la imagen.',
      });
    }
  };

  const handleSaveHealthTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthForm.title.trim()) {
      setFeedback({ type: 'err', text: 'El título del consejo es obligatorio.' });
      return;
    }
    setSavingHealthTip(true);
    setFeedback(null);
    const payload = {
      title: healthForm.title.trim(),
      imageUrl: healthForm.imageUrl,
      recommendation: healthForm.recommendation.trim(),
      explanation: healthForm.explanation.trim(),
      practicalTips: healthForm.practicalTipsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      precautions: healthForm.precautions.trim(),
      active: healthForm.active,
    };
    try {
      const url = healthForm.id
        ? `/api/admin/health-tips/${healthForm.id}`
        : '/api/admin/health-tips';
      const method = healthForm.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Error al guardar consejo.' });
        return;
      }
      setHealthFormOpen(false);
      await fetchDashboard(token);
      onCatalogUpdated();
      setFeedback({
        type: 'ok',
        text: healthForm.id
          ? 'Consejo de salud actualizado.'
          : 'Consejo de salud publicado en BELÉN TE CUIDA.',
      });
    } catch {
      setFeedback({ type: 'err', text: 'Error de red al guardar consejo.' });
    } finally {
      setSavingHealthTip(false);
    }
  };

  const handleDeleteHealthTip = async (id: string, title: string) => {
    const res = await fetch(`/api/admin/health-tips/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchDashboard(token);
      onCatalogUpdated();
      setFeedback({ type: 'ok', text: `Consejo "${title}" eliminado.` });
    }
  };

  const liveSavings = calculatePromoSavings({
    unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
    promoQuantity: form.promoQuantity ? Number(form.promoQuantity) : null,
    promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
  });

  const liveWholesale = calculateWholesaleSavings({
    unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
    wholesalePrice: form.wholesalePrice ? Number(form.wholesalePrice) : null,
    wholesaleMinQuantity: form.wholesaleMinQuantity ? Number(form.wholesaleMinQuantity) : 3,
  });

  // Login Gate (Private administrative panel never shown to visitors)
  if (!token) {
    return (
      <section className="max-w-md mx-auto px-4 py-12 pb-24">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#10245A]/15 shadow-sm space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#1746D2]/10 text-[#1746D2] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-extrabold text-2xl text-[#10245A]">
              Panel Privado de Administración
            </h1>
            <p className="text-sm text-[#10245A]/70">
              Ingresa tu clave para gestionar productos, analizar fotografías con IA, ver estadísticas reales y generar las 9 láminas comerciales.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-pin-input"
                className="text-xs font-bold text-[#10245A]/75 block"
              >
                Clave de acceso
              </label>
              <input
                id="admin-pin-input"
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa tu clave..."
                required
                className="w-full min-h-[48px] px-4 py-2 rounded-xl border border-[#10245A]/20 text-base text-[#10245A]"
              />
            </div>

            {authError && (
              <p className="text-xs font-bold text-[#F04424] bg-[#F04424]/10 p-3 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#1746D2] hover:bg-[#10245A] text-white font-bold text-sm cursor-pointer"
            >
              {loggingIn ? 'Verificando...' : 'Ingresar a Administración'}
            </button>
          </form>

          <p className="text-xs text-[#10245A]/60 bg-[#FFF8E7] p-3 rounded-xl">
            Clave inicial configurada para primera prueba: <strong className="font-mono text-[#10245A]">2026</strong>. Puedes cambiarla luego en la pestaña Contacto.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 space-y-6">
      {/* Header del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#10245A]/10">
        <div>
          <p className="text-xs font-bold text-[#E6007E] uppercase tracking-wider">
            Uso interno · BELÉN LA CASERITA BOLIVIA
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#10245A]">
            Panel de Administración
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFF8E7] hover:bg-[#F04424]/15 text-[#10245A] text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión y volver</span>
        </button>
      </div>

      {/* Navegación interna del Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          type="button"
          onClick={() => setTab('products')}
          className={`min-h-[48px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            tab === 'products'
              ? 'bg-[#10245A] text-white'
              : 'bg-[#FFF8E7] text-[#10245A] hover:bg-[#FFD500]/30'
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Productos e IA</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('slides')}
          className={`min-h-[48px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            tab === 'slides'
              ? 'bg-[#E6007E] text-white'
              : 'bg-[#FFF8E7] text-[#10245A] hover:bg-[#FFD500]/30'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>9 Láminas (9:16)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('health')}
          className={`min-h-[48px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            tab === 'health'
              ? 'bg-[#E6007E] text-white'
              : 'bg-[#FFF8E7] text-[#10245A] hover:bg-[#FFD500]/30'
          }`}
        >
          <Heart className="w-4 h-4 shrink-0" />
          <span>Belén te cuida</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('stats')}
          className={`min-h-[48px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            tab === 'stats'
              ? 'bg-[#00A83B] text-white'
              : 'bg-[#FFF8E7] text-[#10245A] hover:bg-[#FFD500]/30'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Visitas Reales</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('settings')}
          className={`min-h-[48px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            tab === 'settings'
              ? 'bg-[#1746D2] text-white'
              : 'bg-[#FFF8E7] text-[#10245A] hover:bg-[#FFD500]/30'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Contacto y Paleta</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-sm font-semibold ${
            feedback.type === 'ok'
              ? 'bg-[#00A83B]/12 text-[#00A83B]'
              : 'bg-[#F04424]/12 text-[#F04424]'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {loadingDash && !dashboard && (
        <p className="text-sm text-[#10245A]/70 py-6">Cargando datos del panel...</p>
      )}

      {/* TAB 1: PRODUCTOS + IA */}
      {tab === 'products' && dashboard && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#10245A]/75">
              {dashboard.products.length} productos registrados en el catálogo.
            </p>
            <button
              type="button"
              onClick={() => {
                setForm(
                  emptyForm(
                    dashboard.settings.defaultDelivery,
                    dashboard.settings.defaultPayment
                  )
                );
                setAiNote('');
                setFormOpen(true);
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar nuevo producto</span>
            </button>
          </div>

          {formOpen && (
            <form
              onSubmit={handleSaveProduct}
              className="p-5 sm:p-6 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/15 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-[#10245A]">
                  {form.id ? 'Editar producto' : 'Registrar nuevo producto'}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-xs font-bold text-[#10245A]/70 hover:text-[#F04424] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {/* BLOQUE 1: FOTOGRAFÍAS EN FORMATO 1:1 (CARRUSEL) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1746D2]/20 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-4">
                    <div className="aspect-square w-full max-w-[240px] mx-auto rounded-xl overflow-hidden bg-white border border-[#10245A]/15">
                      <ProductCarousel
                        images={form.images}
                        alt={form.name || 'Vista previa 1:1 del producto'}
                        resetKey={form.id || 'new'}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1746D2] block">
                        Campo de Fotografías · Relación 1:1 (Cuadrado)
                      </span>
                      <p className="text-sm font-bold text-[#10245A]">
                        1. Carrusel de fotografías del producto (Formato 1:1 Cuadrado)
                      </p>
                      <p className="text-xs text-[#10245A]/70 mt-0.5">
                        Sube varias fotos desde tu celular Android o agrégalas por URL. Se mostrarán en contenedor cuadrado 1:1 con deslizamiento táctil (swipe) sin deformar ni recortar el producto.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <label className="min-h-[44px] px-4 py-2 rounded-xl bg-[#10245A] hover:bg-[#1746D2] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Subir fotos (1:1)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="sr-only"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleAnalyzeWithAI}
                        disabled={analyzingAI || form.images.length === 0}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E6007E] hover:bg-[#c5006c] disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {analyzingAI ? 'Analizando foto...' : 'Analizar foto principal con IA'}
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Link2 className="w-4 h-4 text-[#10245A]/45 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={newImageUrlInput}
                          onChange={(e) => setNewImageUrlInput(e.target.value)}
                          placeholder="O pega la URL de una fotografía (https://...)"
                          className="w-full min-h-[42px] pl-9 pr-3 py-1.5 rounded-xl border border-[#10245A]/20 text-xs sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        disabled={!newImageUrlInput.trim()}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFF8E7] hover:bg-[#FFD500]/40 disabled:opacity-50 text-[#10245A] border border-[#10245A]/15 text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        + Agregar foto por URL
                      </button>
                    </div>

                    {aiNote && (
                      <p className="text-xs font-semibold text-[#1746D2] bg-[#1746D2]/10 p-3 rounded-xl">
                        {aiNote}
                      </p>
                    )}
                  </div>
                </div>

                {form.images.length > 0 && (
                  <div className="pt-3 border-t border-[#10245A]/10 space-y-2">
                    <p className="text-xs font-bold text-[#10245A]/75">
                      Fotografías cargadas en el carrusel 1:1 ({form.images.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {form.images.map((imgSrc, idx) => (
                        <div
                          key={`${imgSrc}-${idx}`}
                          className="p-2 rounded-xl bg-[#FFF8E7]/60 border border-[#10245A]/12 space-y-1.5"
                        >
                          <div className="aspect-square w-full rounded-lg overflow-hidden bg-white border border-[#10245A]/10 flex items-center justify-center">
                            <ProductImage
                              src={imgSrc}
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            {idx === 0 ? (
                              <span className="font-bold text-[#00A83B] flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-[#00A83B]" />
                                Portada
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMakePrimaryImage(idx)}
                                className="font-bold text-[#1746D2] hover:underline cursor-pointer"
                              >
                                Hacer portada
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              aria-label={`Quitar foto ${idx + 1}`}
                              className="text-[#F04424] hover:underline font-bold cursor-pointer"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* BLOQUE 2: VIDEO DEMOSTRATIVO EN FORMATO 9:16 (VERTICAL INDEPENDIENTE) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6007E]/25 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E6007E] block">
                        Campo de Video · Relación 9:16 (Vertical Reels / TikTok)
                      </span>
                      <p className="text-sm font-bold text-[#10245A]">
                        2. Video demostrativo del producto (Formato 9:16 Vertical — independiente de las fotos 1:1)
                      </p>
                      <p className="text-xs text-[#10245A]/70 mt-0.5">
                        Sube un video vertical (MP4, WebM o MOV desde tu celular) o pega el enlace de un video vertical (YouTube Shorts, TikTok, Instagram Reel o MP4). El botón «Ver cómo funciona el video de uso real» aparece en todos los productos y reproduce aquí el video que cargues.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 items-center">
                      <label className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E6007E] hover:bg-[#c5006c] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer">
                        <Video className="w-4 h-4" />
                        <span>
                          {uploadingVideo ? 'Subiendo video...' : 'Subir video vertical (9:16)'}
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          disabled={uploadingVideo}
                          onChange={handleVideoUpload}
                          className="sr-only"
                        />
                      </label>

                      {form.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, videoUrl: '' }))}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F04424]/10 text-[#F04424] text-xs font-bold cursor-pointer"
                        >
                          Quitar video
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#10245A]/75 block">
                        URL del video vertical 9:16 (opcional si no subiste archivo)
                      </label>
                      <input
                        type="text"
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        placeholder="Ej. https://...mp4 o enlace de TikTok / YouTube Shorts / Reels"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    {form.videoUrl ? (
                      <ProductVideoPlayer
                        videoUrl={form.videoUrl}
                        productName={form.name || 'Vista previa'}
                        maxWidthClass="max-w-[170px]"
                      />
                    ) : (
                      <div className="aspect-[9/16] max-w-[170px] mx-auto rounded-2xl bg-[#FFF8E7] border border-dashed border-[#E6007E]/40 flex flex-col items-center justify-center p-4 text-center gap-2">
                        <Video className="w-8 h-8 text-[#E6007E]/60" />
                        <span className="text-[11px] font-bold text-[#10245A]/70">
                          Espacio vertical 9:16 (sin video aún)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Datos básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Categoría
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  >
                    {PRODUCT_CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#10245A]/75 block">
                  Descripción verificable
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Características reales (una por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={form.characteristicsText}
                    onChange={(e) =>
                      setForm({ ...form, characteristicsText: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Beneficios comprobables (uno por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={form.benefitsText}
                    onChange={(e) => setForm({ ...form, benefitsText: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Precios y Promoción con Cálculo Automático */}
              <div className="p-4 rounded-2xl bg-white border border-[#10245A]/12 space-y-4">
                <h3 className="font-display font-bold text-base text-[#10245A]">
                  Precios, Promociones y Ahorro Automático
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#10245A]/75 block">
                      Precio unitario (Bs.)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={form.unitPrice}
                      onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                      placeholder="Ej. 55"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#10245A]/75 block">
                      Nombre de la promo
                    </label>
                    <input
                      type="text"
                      value={form.promoTitle}
                      onChange={(e) => setForm({ ...form, promoTitle: e.target.value })}
                      placeholder="Ej. Pack Familiar x3"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#10245A]/75 block">
                      Cantidad del paquete
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.promoQuantity}
                      onChange={(e) => setForm({ ...form, promoQuantity: e.target.value })}
                      placeholder="Ej. 3"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#10245A]/75 block">
                      Precio paquete (Bs.)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={form.promoPrice}
                      onChange={(e) => setForm({ ...form, promoPrice: e.target.value })}
                      placeholder="Ej. 145"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm tabular-nums"
                    />
                  </div>
                </div>

                {liveSavings && (
                  <p className="text-xs sm:text-sm font-bold text-[#00A83B] bg-[#00A83B]/10 px-3.5 py-2.5 rounded-xl tabular-nums">
                    Cálculo automático: Precio normal Bs. {liveSavings.regularTotal.toFixed(2)} ·
                    Precio promo Bs. {liveSavings.promoPrice.toFixed(2)} · Ahorro real: Bs.{' '}
                    {liveSavings.savings.toFixed(2)} (-{liveSavings.discountPercent}%)
                  </p>
                )}

                <div className="pt-3 border-t border-[#10245A]/10 space-y-3">
                  <h4 className="font-display font-bold text-sm text-[#1746D2]">
                    Precio Especial por Mayor (Cálculo automático)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#10245A]/75 block">
                        Precio especial por mayor (Bs. por unidad)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={form.wholesalePrice}
                        onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })}
                        placeholder="Ej. 45"
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#10245A]/75 block">
                        Compra mínima por mayor (unidades)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={form.wholesaleMinQuantity}
                        onChange={(e) =>
                          setForm({ ...form, wholesaleMinQuantity: e.target.value })
                        }
                        placeholder="3"
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm tabular-nums"
                      />
                    </div>
                  </div>
                  {liveWholesale && (
                    <p className="text-xs sm:text-sm font-bold text-[#1746D2] bg-[#1746D2]/10 px-3.5 py-2.5 rounded-xl tabular-nums">
                      Total por mayor ({liveWholesale.minQty} unid.): Bs.{' '}
                      {liveWholesale.wholesaleTotal.toFixed(2)}
                      {liveWholesale.savings > 0 &&
                        ` · Ahorro por mayor: Bs. ${liveWholesale.savings.toFixed(2)} (-${liveWholesale.discountPercent}%)`}
                    </p>
                  )}
                </div>
              </div>

              {/* Uso, Bienestar, Entrega y Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Formas de uso (Lámina 7)
                  </label>
                  <textarea
                    rows={2}
                    value={form.usage}
                    onChange={(e) => setForm({ ...form, usage: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    BELÉN TE CUIDA: consejo de bienestar (Lámina 8, sin afirmaciones médicas)
                  </label>
                  <textarea
                    rows={2}
                    value={form.wellnessTip}
                    onChange={(e) => setForm({ ...form, wellnessTip: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Formas de entrega (Lámina 4)
                  </label>
                  <input
                    type="text"
                    value={form.deliveryInfo}
                    onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Formas de pago (Lámina 5)
                  </label>
                  <input
                    type="text"
                    value={form.paymentInfo}
                    onChange={(e) => setForm({ ...form, paymentInfo: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Gestionar Testimonios / Reseñas reales */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#10245A]/15 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#10245A]">
                      Gestionar Testimonios / Reseñas (Lámina 6)
                    </h3>
                    <p className="text-xs text-[#10245A]/65">
                      Carga únicamente reseñas reales recibidas por WhatsApp, Facebook/TikTok o compras presenciales (3, 4 o 5 estrellas).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const msg = `¡Hola [Nombre]! 👋 Te saluda BELÉN LA CASERITA BOLIVIA 🇧🇴. Queremos saber cómo te fue con tu ${form.name.trim() || '[Nombre del producto]'}. ¿Del 1 al 5 cuántas estrellas le darías y cómo te está ayudando en tu descanso o bienestar diario? Tu opinión ayuda a otros clientes a elegir mejor 🙌.`;
                        await navigator.clipboard.writeText(msg).catch(() => {});
                        setFeedback({
                          type: 'ok',
                          text: 'Mensaje para solicitar reseña real por WhatsApp copiado al portapapeles.',
                        });
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#00A83B]/10 hover:bg-[#00A83B]/20 text-[#00A83B] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar mensaje para pedir reseña</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          testimonials: [
                            ...prev.testimonials,
                            {
                              author: '',
                              city: '',
                              rating: 5,
                              quote: '',
                              verifiedDate: new Date().toISOString().slice(0, 10),
                              active: true,
                            },
                          ],
                        }))
                      }
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FFF8E7] hover:bg-[#FFD500]/40 text-[#10245A] border border-[#10245A]/15 text-xs font-bold cursor-pointer"
                    >
                      + Agregar reseña real
                    </button>
                  </div>
                </div>

                <datalist id="bolivia-cities">
                  <option value="Santa Cruz" />
                  <option value="La Paz" />
                  <option value="Cochabamba" />
                  <option value="El Alto" />
                  <option value="Tarija" />
                  <option value="Oruro" />
                  <option value="Sucre" />
                  <option value="Potosí" />
                  <option value="Trinidad" />
                </datalist>

                {form.testimonials.length === 0 ? (
                  <p className="text-xs text-[#10245A]/60 bg-[#FFF8E7]/70 p-3 rounded-xl">
                    No hay reseñas cargadas para este producto. Pulsa «+ Agregar reseña real» cuando un cliente te comparta su opinión.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.testimonials.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FFF8E7]/60 border border-[#10245A]/12 space-y-2.5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[11px] font-bold text-[#10245A]/70 block">
                              Nombre del cliente *
                            </label>
                            <input
                              type="text"
                              placeholder="Ej. María Fernández"
                              value={t.author}
                              onChange={(e) => {
                                const copy = [...form.testimonials];
                                copy[idx] = { ...copy[idx], author: e.target.value };
                                setForm({ ...form, testimonials: copy });
                              }}
                              className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-[#10245A]/20 bg-white text-xs"
                            />
                          </div>

                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[11px] font-bold text-[#10245A]/70 block">
                              Ciudad (Bolivia)
                            </label>
                            <input
                              type="text"
                              list="bolivia-cities"
                              placeholder="Ej. La Paz, Santa Cruz..."
                              value={t.city || ''}
                              onChange={(e) => {
                                const copy = [...form.testimonials];
                                copy[idx] = { ...copy[idx], city: e.target.value };
                                setForm({ ...form, testimonials: copy });
                              }}
                              className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-[#10245A]/20 bg-white text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#10245A]/70 block">
                              Estrellas
                            </label>
                            <select
                              value={t.rating ?? 5}
                              onChange={(e) => {
                                const copy = [...form.testimonials];
                                copy[idx] = { ...copy[idx], rating: Number(e.target.value) };
                                setForm({ ...form, testimonials: copy });
                              }}
                              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#10245A]/20 bg-white text-xs font-bold"
                            >
                              <option value={5}>5 estrellas</option>
                              <option value={4}>4 estrellas</option>
                              <option value={3}>3 estrellas</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#10245A]/70 block">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={t.verifiedDate || ''}
                              onChange={(e) => {
                                const copy = [...form.testimonials];
                                copy[idx] = { ...copy[idx], verifiedDate: e.target.value };
                                setForm({ ...form, testimonials: copy });
                              }}
                              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#10245A]/20 bg-white text-xs tabular-nums"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#10245A]/70 block">
                              Estado
                            </label>
                            <select
                              value={t.active === false ? 'hidden' : 'active'}
                              onChange={(e) => {
                                const copy = [...form.testimonials];
                                copy[idx] = {
                                  ...copy[idx],
                                  active: e.target.value === 'active',
                                };
                                setForm({ ...form, testimonials: copy });
                              }}
                              className={`w-full min-h-[38px] px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                                t.active === false
                                  ? 'border-[#F04424]/40 bg-[#F04424]/10 text-[#F04424]'
                                  : 'border-[#00A83B]/40 bg-[#00A83B]/10 text-[#00A83B]'
                              }`}
                            >
                              <option value="active">Activo</option>
                              <option value="hidden">Oculto</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                          <div className="flex-1 space-y-1">
                            <label className="text-[11px] font-bold text-[#10245A]/70 block">
                              Comentario real sobre uso y bienestar *
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Escribe o pega el comentario real recibido del cliente..."
                              value={t.quote}
                              onChange={(e) => {
                                const copy = [...form.testimonials];
                                copy[idx] = { ...copy[idx], quote: e.target.value };
                                setForm({ ...form, testimonials: copy });
                              }}
                              className="w-full p-2.5 rounded-lg border border-[#10245A]/20 bg-white text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                testimonials: form.testimonials.filter((_, i) => i !== idx),
                              })
                            }
                            aria-label="Eliminar reseña"
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#F04424]/10 hover:bg-[#F04424]/20 text-[#F04424] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#10245A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 accent-[#00A83B]"
                  />
                  <span>Visible en el catálogo público</span>
                </label>

                <button
                  type="submit"
                  disabled={savingProduct}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProduct ? 'Guardando...' : 'Guardar producto'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Lista de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard.products.map((prod) => {
              const savings = calculatePromoSavings(prod);
              const prodImgs = getProductImages(prod);
              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl bg-white border border-[#10245A]/12 flex gap-4 items-center"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-[#10245A]/10 shrink-0 flex items-center justify-center p-1">
                    <ProductImage
                      src={prodImgs[0] || prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#10245A]/60">
                      <span className="truncate text-[#1746D2]">{prod.category}</span>
                      <span>·</span>
                      <span className="tabular-nums">{prod.views} vistas</span>
                      <span>·</span>
                      <span>{prodImgs.length} foto{prodImgs.length === 1 ? '' : 's'} (1:1)</span>
                      {prod.videoUrl ? (
                        <span className="text-[#00A83B]">· Video 9:16 listo</span>
                      ) : (
                        <span className="text-[#E6007E]">· Sin video aún</span>
                      )}
                      {!prod.active && <span className="text-[#F04424]">· Oculto</span>}
                    </div>
                    <h3 className="font-display font-bold text-base text-[#10245A] truncate">
                      {prod.name}
                    </h3>
                    <p className="text-xs font-bold text-[#10245A] tabular-nums">
                      {prod.unitPrice ? `Bs. ${prod.unitPrice.toFixed(2)}` : 'Sin precio'}
                      {savings && (
                        <span className="text-[#00A83B] ml-2">
                          · {prod.promoTitle}: Bs. {savings.promoPrice.toFixed(2)} (-{savings.discountPercent}%)
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setForm(productToForm(prod));
                          setAiNote('');
                          setFormOpen(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF8E7] text-[#10245A] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSlideProductId(prod.id);
                          setTab('slides');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#E6007E]/10 text-[#E6007E] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>9 Láminas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="px-3 py-1.5 rounded-lg bg-[#F04424]/10 text-[#F04424] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 9 LÁMINAS */}
      {tab === 'slides' && dashboard && (
        <SlideGenerator
          products={dashboard.products}
          settings={dashboard.settings}
          initialProductId={slideProductId}
        />
      )}

      {/* TAB 3: BELÉN TE CUIDA – CONSEJOS DE SALUD */}
      {tab === 'health' && dashboard && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-xl text-[#10245A]">
                BELÉN TE CUIDA – Plus de Salud y Bienestar
              </h2>
              <p className="text-sm text-[#10245A]/75">
                Agrega y edita aquí los consejos de salud que verán los visitantes al pulsar «❤️ DESCUBRIR CONSEJO DE SALUD».
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHealthForm(emptyHealthForm());
                setHealthFormOpen(true);
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#c5006c] text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo consejo de salud</span>
            </button>
          </div>

          {healthFormOpen && (
            <form
              onSubmit={handleSaveHealthTip}
              className="p-5 sm:p-6 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/15 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-[#10245A]">
                  {healthForm.id ? 'Editar consejo de salud' : 'Registrar consejo de salud'}
                </h3>
                <button
                  type="button"
                  onClick={() => setHealthFormOpen(false)}
                  className="text-xs font-bold text-[#10245A]/70 hover:text-[#F04424] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-[#10245A]/10">
                <div className="md:col-span-4">
                  <div className="aspect-square max-w-[200px] mx-auto w-full rounded-xl overflow-hidden bg-[#FFF8E7] border border-[#10245A]/10 flex items-center justify-center">
                    <ProductImage
                      src={healthForm.imageUrl}
                      alt={healthForm.title || 'Imagen ilustrativa 1:1'}
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                </div>
                <div className="md:col-span-8 space-y-2.5">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Imagen ilustrativa (Formato 1:1 cuadrado)
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    <label className="min-h-[44px] px-4 py-2 rounded-xl bg-[#10245A] hover:bg-[#1746D2] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Subir imagen (1:1)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHealthPhotoUpload}
                        className="sr-only"
                      />
                    </label>
                    {healthForm.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setHealthForm({ ...healthForm, imageUrl: '' })}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-[#F04424]/10 text-[#F04424] text-xs font-bold cursor-pointer"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={healthForm.imageUrl}
                    onChange={(e) => setHealthForm({ ...healthForm, imageUrl: e.target.value })}
                    placeholder="O pega la URL de la imagen (https://...)"
                    className="w-full min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#10245A]/20 bg-white text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#10245A]/75 block">
                  Título del remedio natural o consejo *
                </label>
                <input
                  type="text"
                  required
                  value={healthForm.title}
                  onChange={(e) => setHealthForm({ ...healthForm, title: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#10245A]/75 block">
                  Para qué y por qué es importante (Recomendación)
                </label>
                <textarea
                  rows={3}
                  value={healthForm.recommendation}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, recommendation: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#10245A]/75 block">
                  Cómo mejora la salud y beneficios al practicarlo (Explicación)
                </label>
                <textarea
                  rows={3}
                  value={healthForm.explanation}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, explanation: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Consejos prácticos (uno por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={healthForm.practicalTipsText}
                    onChange={(e) =>
                      setHealthForm({ ...healthForm, practicalTipsText: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#10245A]/75 block">
                    Precauciones
                  </label>
                  <textarea
                    rows={3}
                    value={healthForm.precautions}
                    onChange={(e) =>
                      setHealthForm({ ...healthForm, precautions: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[#10245A]/20 bg-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#10245A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={healthForm.active}
                    onChange={(e) =>
                      setHealthForm({ ...healthForm, active: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#00A83B]"
                  />
                  <span>Visible en la sección pública</span>
                </label>

                <button
                  type="submit"
                  disabled={savingHealthTip}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-[#00A83B] hover:bg-[#008F32] text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingHealthTip ? 'Guardando...' : 'Guardar consejo'}</span>
                </button>
              </div>
            </form>
          )}

          {dashboard.healthTips.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-[#10245A]/12 text-center">
              <p className="text-sm text-[#10245A]/70">
                Aún no hay consejos de salud registrados. Usa «Nuevo consejo de salud» cuando estés listo para publicarlos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.healthTips.map((tip: HealthTip) => (
                <div
                  key={tip.id}
                  className="p-4 rounded-2xl bg-white border border-[#10245A]/12 flex gap-4 items-center"
                >
                  {tip.imageUrl && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-[#10245A]/10 shrink-0 flex items-center justify-center p-1">
                      <ProductImage
                        src={tip.imageUrl}
                        alt={tip.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-display font-bold text-base text-[#10245A] truncate">
                      {tip.title}
                    </h3>
                    {tip.recommendation && (
                      <p className="text-xs text-[#10245A]/70 line-clamp-2">
                        {tip.recommendation}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setHealthForm({
                            id: tip.id,
                            title: tip.title,
                            imageUrl: tip.imageUrl,
                            recommendation: tip.recommendation,
                            explanation: tip.explanation,
                            practicalTipsText: tip.practicalTips.join('\n'),
                            precautions: tip.precautions,
                            active: tip.active,
                          });
                          setHealthFormOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF8E7] text-[#10245A] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHealthTip(tip.id, tip.title)}
                        className="px-3 py-1.5 rounded-lg bg-[#F04424]/10 text-[#F04424] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ESTADÍSTICAS REALES */}
      {tab === 'stats' && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/12">
              <p className="text-xs font-bold text-[#10245A]/65">
                Total histórico de visitas reales
              </p>
              <p className="font-display font-extrabold text-3xl text-[#10245A] tabular-nums mt-1">
                {dashboard.visitStats.totalVisits}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/12">
              <p className="text-xs font-bold text-[#10245A]/65">
                Visitas de hoy ({dashboard.visitStats.todayDate})
              </p>
              <p className="font-display font-extrabold text-3xl text-[#E6007E] tabular-nums mt-1">
                {dashboard.visitStats.todayVisits}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#10245A]/12 space-y-3">
            <h3 className="font-display font-bold text-lg text-[#10245A]">
              Productos más visitados
            </h3>
            <div className="divide-y divide-[#10245A]/10">
              {dashboard.products
                .slice()
                .sort((a, b) => b.views - a.views)
                .map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="font-semibold text-[#10245A] truncate">
                      {p.name}
                    </span>
                    <span className="font-mono font-bold text-[#00A83B] tabular-nums shrink-0">
                      {p.views} visitas
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#10245A]/12 space-y-3">
            <h3 className="font-display font-bold text-lg text-[#10245A]">
              Registro diario de visitas
            </h3>
            {dashboard.dailyHistory.length === 0 ? (
              <p className="text-sm text-[#10245A]/65">
                Aún no hay registros de visitas diarias.
              </p>
            ) : (
              <div className="divide-y divide-[#10245A]/10">
                {dashboard.dailyHistory.map((d) => (
                  <div
                    key={d.date}
                    className="py-2 flex items-center justify-between text-sm"
                  >
                    <span className="font-mono text-[#10245A]/80">{d.date}</span>
                    <span className="font-mono font-bold text-[#1746D2] tabular-nums">
                      {d.count} visitas
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-[#10245A]/75 bg-[#FFF8E7] p-4 rounded-xl border border-[#10245A]/10">
            {dashboard.visitStats.storageNotice}
          </p>
        </div>
      )}

      {/* TAB 4: CONTACTO Y PALETA OFICIAL */}
      {tab === 'settings' && dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveSettings}
            className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white border border-[#10245A]/12 space-y-4"
          >
            <h2 className="font-display font-bold text-xl text-[#10245A]">
              Información de contacto y soporte
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#10245A]/75 block">
                  Código país
                </label>
                <input
                  type="text"
                  value={waCountryCode}
                  onChange={(e) => setWaCountryCode(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm tabular-nums"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#10245A]/75 block">
                  Número oficial de WhatsApp
                </label>
                <input
                  type="text"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#10245A]/20 text-sm font-bold tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10245A]/75 block">
                Título sección de soporte
              </label>
              <input
                type="text"
                value={supportTitle}
                onChange={(e) => setSupportTitle(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10245A]/75 block">
                Texto de atención al cliente
              </label>
              <textarea
                rows={3}
                value={supportText}
                onChange={(e) => setSupportText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#10245A]/20 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10245A]/75 block">
                Condiciones de entrega predeterminadas
              </label>
              <input
                type="text"
                value={defaultDelivery}
                onChange={(e) => setDefaultDelivery(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10245A]/75 block">
                Formas de pago predeterminadas
              </label>
              <input
                type="text"
                value={defaultPayment}
                onChange={(e) => setDefaultPayment(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 text-sm"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-[#10245A]/10">
              <label className="text-xs font-bold text-[#10245A]/75 block">
                Cambiar clave de administración (opcional, mínimo 4 caracteres)
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Dejar en blanco para mantener la clave actual"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#10245A]/20 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#1746D2] hover:bg-[#10245A] text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Guardando...' : 'Guardar configuración'}</span>
            </button>
          </form>

          {/* Paleta Oficial de 9 Colores */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#FFF8E7] border border-[#10245A]/12 space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-[#10245A]">
                Paleta de Colores Oficial
              </h2>
              <p className="text-xs text-[#10245A]/70 mt-0.5">
                Referencia cromática inspirada en el tejido andino boliviano.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {OFFICIAL_PALETTE.map((color) => (
                <div
                  key={color.hex}
                  className="bg-white p-2 rounded-xl border border-[#10245A]/10 text-center"
                >
                  <div
                    className="h-12 w-full rounded-lg border border-[#10245A]/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="text-[10px] font-bold text-[#10245A] mt-1.5 leading-tight">
                    {color.name}
                  </p>
                  <p className="text-[11px] font-mono text-[#10245A]/70">
                    {color.hex}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDownloadPaletteSvg}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#10245A] hover:bg-[#1746D2] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar lámina oficial (paleta-belen.svg)</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
