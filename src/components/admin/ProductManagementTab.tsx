import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  Star,
  SlidersHorizontal,
  ExternalLink,
  Upload,
  AlertTriangle,
  ArrowLeft,
  LayoutGrid,
  Film,
  Image as ImageIcon,
  Play,
  Bold,
  Italic,
  Strikethrough,
  Minus,
  Link as LinkIcon,
  Quote,
  Code,
  Smile,
  Table,
  List,
  ListOrdered,
  HelpCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Product, MediaItem } from '../../types';
import { AnimatedButton } from '../AnimatedButton';
import { MediaTab } from './MediaTab';
import { ProductDescriptionEditor } from './ProductDescriptionEditor';

interface ProductManagementTabProps {
  products: Product[];
  categories: string[];
  mediaList?: MediaItem[];
  onAddProduct: (product: Product) => void | Promise<any>;
  onUpdateProduct: (product: Product) => void | Promise<any>;
  onDeleteProduct: (productId: string) => void | Promise<any>;
  onAddMedia?: (media: MediaItem) => void;
  isAddModalOpenInitially?: boolean;
}

export const ProductManagementTab: React.FC<ProductManagementTabProps> = ({
  products,
  categories,
  mediaList = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddMedia,
  isAddModalOpenInitially = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(isAddModalOpenInitially);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states matching Screenshot 1
  const [name, setName] = useState('');
  const [banglaTitle, setBanglaTitle] = useState('');
  const [category, setCategory] = useState(categories[1] || 'Gaming & Gears');
  const [baseSku, setBaseSku] = useState('');
  const [initialStock, setInitialStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [weight, setWeight] = useState<string>('0.5');
  const [dimensionL, setDimensionL] = useState<string>('');
  const [dimensionW, setDimensionW] = useState<string>('');
  const [dimensionH, setDimensionH] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [stockAlert, setStockAlert] = useState<number>(10);

  // Gallery items (images & videos from local device or media gallery)
  const [galleryItems, setGalleryItems] = useState<{ url: string; type: 'image' | 'video'; name?: string }[]>([]);

  // Variants state
  const [variants, setVariants] = useState<{ attribute: string; values: string }[]>([
    { attribute: 'Color', values: 'Red, Green, Blue' },
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setBanglaTitle('');
    setCategory(categories.find((c) => c !== 'All Categories') || 'Gaming & Gears');
    setBaseSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setInitialStock(25);
    setDescription('High performance original gadget with fast delivery across Bangladesh.');
    setBasePrice(1200);
    setSalePrice(999);
    setWeight('0.5');
    setDimensionL('15');
    setDimensionW('10');
    setDimensionH('5');
    setStatus('active');
    setStockAlert(5);
    setGalleryItems([
      {
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        name: 'Cover Photo',
      },
    ]);
    setVariants([{ attribute: 'Color', values: 'Black, White' }]);
    setIsEditorOpen(true);
  };

  // Open Edit Mode
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.title);
    setBanglaTitle(prod.banglaTitle || '');
    setCategory(prod.category);
    setBaseSku(prod.sku || `SKU-${prod.id.slice(0, 6).toUpperCase()}`);
    setInitialStock(prod.inStock ? 20 : 0);
    setDescription(prod.description || '');
    setBasePrice(prod.originalPrice || prod.price);
    setSalePrice(prod.price < prod.originalPrice ? prod.price : '');
    setWeight(prod.weight ? String(prod.weight) : '0.5');
    setDimensionL(prod.dimensions?.l || '');
    setDimensionW(prod.dimensions?.w || '');
    setDimensionH(prod.dimensions?.h || '');
    setStatus(prod.inStock ? 'active' : 'inactive');
    setStockAlert(prod.stockAlert || 5);

    // Populate gallery items
    const items: { url: string; type: 'image' | 'video'; name?: string }[] = [];
    if (prod.image) {
      items.push({ url: prod.image, type: 'image', name: 'Main Image' });
    }
    if (prod.gallery) {
      prod.gallery.forEach((g, idx) => {
        if (g !== prod.image) {
          items.push({ url: g, type: 'image', name: `Gallery ${idx + 1}` });
        }
      });
    }
    if (prod.videoUrl) {
      items.push({ url: prod.videoUrl, type: 'video', name: 'Product Video' });
    }
    setGalleryItems(items.length > 0 ? items : [{ url: prod.image, type: 'image' }]);

    if (prod.variants && prod.variants.length > 0) {
      setVariants(
        prod.variants.map((v) => ({
          attribute: v.attribute,
          values: v.values.join(', '),
        }))
      );
    } else {
      setVariants([{ attribute: 'Color', values: 'Default' }]);
    }

    setIsEditorOpen(true);
  };

  // Direct device upload for images & videos (with automatic client-side compression for cloud reliability)
  const handleLocalDeviceUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

      if (!isVideo && !isImage) {
        showToast(`"${file.name}" is not an image or video`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawUrl = (e.target?.result as string) || '';
        if (!rawUrl) return;

        if (isImage) {
          const img = new Image();
          img.onload = () => {
            const maxDim = 800;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
              setGalleryItems((prev) => [
                ...prev,
                { url: compressedUrl, type: 'image', name: file.name },
              ]);

              if (onAddMedia) {
                onAddMedia({
                  id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  name: file.name.replace(/\.[^/.]+$/, ''),
                  url: compressedUrl,
                  type: 'product',
                  size: Math.round(compressedUrl.length * 0.75),
                  date: new Date().toISOString().split('T')[0],
                });
              }
            } else {
              setGalleryItems((prev) => [...prev, { url: rawUrl, type: 'image', name: file.name }]);
            }
          };
          img.onerror = () => {
            setGalleryItems((prev) => [...prev, { url: rawUrl, type: 'image', name: file.name }]);
          };
          img.src = rawUrl;
        } else {
          // Video Item
          setGalleryItems((prev) => [...prev, { url: rawUrl, type: 'video', name: file.name }]);
          if (onAddMedia) {
            onAddMedia({
              id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              url: rawUrl,
              type: 'video',
              size: file.size,
              date: new Date().toISOString().split('T')[0],
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });

    showToast(`${files.length} file(s) selected from device!`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save product handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product name is required!');
      return;
    }

    const calculatedPrice = typeof salePrice === 'number' && salePrice > 0 ? salePrice : basePrice;
    const calculatedOriginalPrice = basePrice > calculatedPrice ? basePrice : calculatedPrice;
    const discount =
      calculatedOriginalPrice > calculatedPrice
        ? Math.round(((calculatedOriginalPrice - calculatedPrice) / calculatedOriginalPrice) * 100)
        : 0;

    const primaryImage =
      galleryItems.find((i) => i.type === 'image')?.url ||
      galleryItems[0]?.url ||
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';

    const galleryUrls = galleryItems.filter((i) => i.type === 'image').map((i) => i.url);
    const videoItem = galleryItems.find((i) => i.type === 'video');

    const formattedVariants = variants
      .filter((v) => v.attribute.trim() && v.values.trim())
      .map((v) => ({
        attribute: v.attribute.trim(),
        values: v.values.split(',').map((s) => s.trim()).filter(Boolean),
      }));

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: name.trim(),
        banglaTitle: banglaTitle.trim() || '',
        category,
        sku: baseSku,
        price: calculatedPrice,
        originalPrice: calculatedOriginalPrice,
        discountPercent: discount,
        inStock: status === 'active',
        image: primaryImage,
        gallery: galleryUrls.length > 0 ? galleryUrls : [primaryImage],
        videoUrl: videoItem?.url || '',
        description: description.trim(),
        weight,
        dimensions: { l: dimensionL, w: dimensionW, h: dimensionH },
        stockAlert,
        variants: formattedVariants,
      };
      await onUpdateProduct(updated);
      showToast('Product updated & synced successfully!');
    } else {
      const newProduct: Product = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: name.trim(),
        banglaTitle: banglaTitle.trim() || '',
        category,
        sku: baseSku,
        price: calculatedPrice,
        originalPrice: calculatedOriginalPrice,
        discountPercent: discount,
        rating: 5.0,
        reviewsCount: 1,
        inStock: status === 'active',
        image: primaryImage,
        gallery: galleryUrls.length > 0 ? galleryUrls : [primaryImage],
        videoUrl: videoItem?.url || '',
        description: description.trim(),
        features: ['100% Genuine product', 'Fast doorstep delivery', '7 days replacement warranty'],
        specifications: { Category: category, SKU: baseSku, Weight: `${weight} kg` },
        weight,
        dimensions: { l: dimensionL, w: dimensionW, h: dimensionH },
        stockAlert,
        variants: formattedVariants,
      };
      await onAddProduct(newProduct);
      showToast('New product created & synced successfully!');
    }

    setIsEditorOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.banglaTitle?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'All' || p.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#5b32a3] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-purple-400"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW A: CREATE / EDIT PRODUCT PAGE (EXACT MATCH WITH SCREENSHOT 1) */}
      {isEditorOpen ? (
        <form onSubmit={handleSaveProduct} className="space-y-6 animate-fadeIn">
          {/* Top Bar with Back Arrow and Save Product button matching Screenshot 1 */}
          <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Back to products list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Products</span>
                  <span className="text-slate-400 font-normal">/</span>
                  <span className="text-[#5b32a3]">
                    {editingProduct ? 'Edit' : 'Create'}
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  {editingProduct ? `Editing: ${editingProduct.title}` : 'Add a new product with images, video, pricing & variants'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#5b32a3] hover:bg-[#4d288c] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
            >
              Save Product
            </button>
          </div>

          {/* Main 2-Column Form Layout (Left: Product Info, Right: Gallery & Pricing) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Product Information */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  Product Information
                </h2>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Premium Cotton T-Shirt"
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#5b32a3] focus:ring-1 focus:ring-[#5b32a3]"
                  />
                </div>

                {/* Bangla Name (Optional helper for Duari shop) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বাংলা নাম (Bangla Title - Optional)
                  </label>
                  <input
                    type="text"
                    value={banglaTitle}
                    onChange={(e) => setBanglaTitle(e.target.value)}
                    placeholder="e.g. প্রিমিয়াম কটন টি-শার্ট"
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#5b32a3] focus:ring-1 focus:ring-[#5b32a3]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#5b32a3] cursor-pointer"
                  >
                    {categories
                      .filter((c) => c !== 'All Categories')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Base SKU & Initial Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Base SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={baseSku}
                      onChange={(e) => setBaseSku(e.target.value)}
                      placeholder="e.g. TSHIRT-001"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5b32a3]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                      <span>Initial stock</span>
                      <span className="text-red-500">*</span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5b32a3]"
                    />
                  </div>
                </div>

                {/* Enhanced Product Description Editor */}
                <ProductDescriptionEditor
                  value={description}
                  onChange={setDescription}
                  lang="bn"
                />
              </div>
            </div>

            {/* RIGHT COLUMN (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Hidden file input for direct local device image & video selection */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*,.mp4,.mov,.webm"
                className="hidden"
                onChange={(e) => handleLocalDeviceUpload(e.target.files)}
              />

              {/* Card 2: Product Gallery matching Screenshot 1 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">
                    Product Gallery
                  </h2>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {galleryItems.length} selected
                  </span>
                </div>

                {/* Dashed Box: "Pick from Gallery" or Upload from device matching Screenshot 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsGalleryPickerOpen(true)}
                    className="border-2 border-dashed border-slate-200 hover:border-[#5b32a3] hover:bg-purple-50/20 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5b32a3] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#5b32a3]">
                      Pick from Gallery
                    </span>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#5b32a3]/40 bg-purple-50/20 hover:border-[#5b32a3] hover:bg-purple-50/40 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#5b32a3] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#5b32a3]">
                      Upload from Device
                    </span>
                  </div>
                </div>

                {/* Gallery Previews (Images and Videos) */}
                {galleryItems.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Selected Assets (Images & Videos)
                    </span>

                    <div className="grid grid-cols-3 gap-2.5">
                      {galleryItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group"
                        >
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center relative bg-slate-950">
                              <video
                                src={item.url}
                                className="w-full h-full object-cover opacity-80"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-purple-700 text-white text-[8px] font-extrabold uppercase">
                                Video
                              </span>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Main Cover Tag on First Image */}
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black shadow-2xs">
                              Main Cover
                            </span>
                          )}

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() =>
                              setGalleryItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Pricing, Shipping & Settings matching Screenshot 1 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  Pricing, Shipping & Settings
                </h2>

                {/* Base price & Sale price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Base price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                        ৳
                      </span>
                      <input
                        type="number"
                        required
                        min={0}
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#5b32a3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sale price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                        ৳
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={salePrice}
                        onChange={(e) =>
                          setSalePrice(e.target.value ? Number(e.target.value) : '')
                        }
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#5b32a3]"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  ৳30 - ৳10,000,000 for base and sale. Sale is optional; leave it empty to use the base price. Enter a lower sale price to show a discount.
                </p>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Select or type kg"
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5b32a3]"
                  />
                </div>

                {/* Dimensions (cm) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dimensions (cm)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={dimensionL}
                      onChange={(e) => setDimensionL(e.target.value)}
                      placeholder="L"
                      className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-center focus:outline-none focus:border-[#5b32a3]"
                    />
                    <input
                      type="text"
                      value={dimensionW}
                      onChange={(e) => setDimensionW(e.target.value)}
                      placeholder="W"
                      className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-center focus:outline-none focus:border-[#5b32a3]"
                    />
                    <input
                      type="text"
                      value={dimensionH}
                      onChange={(e) => setDimensionH(e.target.value)}
                      placeholder="H"
                      className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-center focus:outline-none focus:border-[#5b32a3]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Weight up to 1000 kg; dimensions up to 1000 cm. Used for delivery quotes.
                  </p>
                </div>

                {/* Status Toggle Pills & Stock Alert matching Screenshot 1 */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setStatus('active')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          status === 'active'
                            ? 'bg-[#5b32a3] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('inactive')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          status === 'inactive'
                            ? 'bg-[#5b32a3] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                      <span>Stock alert</span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stockAlert}
                      onChange={(e) => setStockAlert(Number(e.target.value))}
                      placeholder="10"
                      className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5b32a3]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FULL WIDTH BOTTOM: Variants matching Screenshot 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Variants
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add attributes like Size or Color, then enter values to generate all variant combinations.
              </p>
            </div>

            {/* Variant attribute rows */}
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80"
                >
                  <div className="w-full sm:w-1/3">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      ATTRIBUTE
                    </label>
                    <input
                      type="text"
                      value={v.attribute}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].attribute = e.target.value;
                        setVariants(copy);
                      }}
                      placeholder="e.g. Color"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5b32a3]"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      VALUES (comma separated)
                    </label>
                    <input
                      type="text"
                      value={v.values}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].values = e.target.value;
                        setVariants(copy);
                      }}
                      placeholder="e.g. Red, Green, Blue"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5b32a3]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-2 self-end sm:self-center text-slate-400 hover:text-red-500 rounded-lg transition-colors mt-2 sm:mt-4"
                    title="Delete attribute"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => [...prev, { attribute: '', values: '' }])
                }
                className="px-4 py-2 rounded-xl border border-[#5b32a3] text-[#5b32a3] bg-purple-50/40 hover:bg-purple-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add attribute</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* VIEW B: PRODUCTS LIST & MANAGEMENT TABLE */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                প্রোডাক্ট ম্যানেজমেন্ট (Products)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার স্টোরের সকল প্রোডাক্ট দেখুন, ছবি ও ভিডিও আপলোড করুন, এবং স্টক ম্যানেজ করুন।
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-[#5b32a3] hover:bg-[#4d288c] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রোডাক্ট যোগ করুন (Add Product)</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="নাম বা কোড দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5b32a3] focus:bg-white"
                />
              </div>

              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#5b32a3] cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories
                  .filter((c) => c !== 'All Categories')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              মোট: <strong className="text-slate-800">{filteredProducts.length}</strong> টি প্রোডাক্ট
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">প্রোডাক্ট (Product)</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">মূল্য (Price)</th>
                    <th className="py-3 px-4">স্টক</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Package className="w-8 h-8 text-slate-300" />
                          <span className="font-bold text-slate-700">
                            কোনো প্রোডাক্ট যুক্ত করা নেই
                          </span>
                          <span className="text-[11px] text-slate-400">
                            নতুন পণ্য যুক্ত করতে উপরের &apos;পণ্য যোগ করুন&apos; বাটনে ক্লিক করুন।
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center relative">
                            {product.videoUrl ? (
                              <>
                                <video
                                  src={product.videoUrl}
                                  className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                                </div>
                              </>
                            ) : (
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <h4 className="font-bold text-slate-900 truncate">
                              {product.title}
                            </h4>
                            {product.banglaTitle && (
                              <p className="text-[11px] text-slate-500 truncate">
                                {product.banglaTitle}
                              </p>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {product.sku || product.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {product.category}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">
                          ৳ {product.price.toLocaleString()}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ৳ {product.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.inStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.inStock ? 'ইন স্টক' : 'স্টক আউট'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#5b32a3] hover:bg-purple-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Media Gallery Picker Modal (When clicking "Pick from Gallery") */}
      <AnimatePresence>
        {isGalleryPickerOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Pick Image or Video from Media Gallery
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any uploaded photo or video to add it to this product
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryPickerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Render MediaTab in picker mode */}
              <MediaTab
                mediaList={mediaList}
                onAddMedia={(item) => {
                  if (onAddMedia) onAddMedia(item);
                }}
                onDeleteMedia={() => {}}
                isPicker
                selectedIds={galleryItems.map((g) => g.url)}
                onSelectMedia={(item) => {
                  setGalleryItems((prev) => [
                    ...prev,
                    { url: item.url, type: item.type === 'video' ? 'video' : 'image', name: item.name },
                  ]);
                  showToast(`Added "${item.name}" to gallery!`);
                  setIsGalleryPickerOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Delete Confirmation Modal (NO window.confirm!) */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    প্রোডাক্ট ডিলিট করতে চান?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to delete this product?
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-800">
                <p className="font-semibold truncate">
                  "{deletingProduct.title}" ডিলিট করলে এটি সাথে সাথে স্টোর ও ক্যাটালগ থেকে মুছে যাবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteProduct(deletingProduct.id);
                    setDeletingProduct(null);
                    showToast('প্রোডাক্ট সফলভাবে ডিলিট হয়েছে');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>হ্যাঁ, ডিলিট করুন (Yes, Delete)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
