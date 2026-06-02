'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Edit2, Trash2, Upload, X, ImageIcon, Check } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  color_images?: Record<string, string>;
  in_stock: boolean;
};

type ImageItem = {
  id: string;
  url: string;
  file?: File;
  isNew: boolean;
  color?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    in_stock: true,
    sizes: [] as string[],
    colors: [] as string[],
    color_images: {} as Record<string, string>,
  });

  // Tag inputs
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  // Multi-image state
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async () => {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('name, slug').order('name')
    ]);

    if (!productsRes.error && productsRes.data) {
      setProducts(productsRes.data);
    }
    if (!categoriesRes.error && categoriesRes.data) {
      setCategories(categoriesRes.data);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 10);

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/-+/g, '-')      // Remove consecutive dashes
      .trim();
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug || '',
        description: product.description || '',
        price: product.price.toString(),
        category: product.category || '',
        in_stock: product.in_stock,
        sizes: product.sizes || [],
        colors: product.colors || [],
        color_images: product.color_images || {},
      });
      const existingImages: ImageItem[] = (product.images || []).map((url) => {
        const color = Object.entries(product.color_images || {}).find(([c, u]) => u === url)?.[0];
        return {
          id: generateId(),
          url,
          isNew: false,
          color,
        };
      });
      if (existingImages.length === 0 && product.image_url) {
        existingImages.push({ id: generateId(), url: product.image_url, isNew: false });
      }
      setImageItems(existingImages);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        category: '',
        in_stock: true,
        sizes: [],
        colors: [],
        color_images: {},
      });
      setImageItems([]);
    }
    setSizeInput('');
    setColorInput('');
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = createSlug(name);
    setFormData((prev) => ({ 
      ...prev, 
      name, 
      slug: prev.slug === createSlug(prev.name) || !prev.slug ? slug : prev.slug 
    }));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      const previewUrl = URL.createObjectURL(file);
      newItems.push({ id: generateId(), url: previewUrl, file, isNew: true });
    }
    setImageItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setImageItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.isNew && item.url) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setImageItems((prev) => {
      const newItems = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      return newItems;
    });
  };

  const addTag = (type: 'sizes' | 'colors', value: string) => {
    const trimmed = value.trim();
    if (trimmed && !formData[type].includes(trimmed)) {
      setFormData({ ...formData, [type]: [...formData[type], trimmed] });
      if (type === 'sizes') setSizeInput('');
      else setColorInput('');
    }
  };

  const removeTag = (type: 'sizes' | 'colors', tag: string) => {
    setFormData({ ...formData, [type]: formData[type].filter(t => t !== tag) });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;
    const { error } = await supabase.storage.from('product-images').upload(filePath, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const finalUrls: string[] = [];
    const colorImages: Record<string, string> = {};
    for (const item of imageItems) {
      if (item.isNew && item.file) {
        const uploadedUrl = await uploadImage(item.file);
        if (uploadedUrl) {
          finalUrls.push(uploadedUrl);
          if (item.color) colorImages[item.color] = uploadedUrl;
        }
      } else {
        finalUrls.push(item.url);
        if (item.color) colorImages[item.color] = item.url;
      }
    }
    const payload = {
      name: formData.name,
      slug: formData.slug || createSlug(formData.name),
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: finalUrls[0] || '',
      images: finalUrls,
      category: formData.category,
      in_stock: formData.in_stock,
      sizes: formData.sizes,
      colors: formData.colors,
      color_images: colorImages,
    };
    const { error } = editingProduct 
      ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
      : await supabase.from('products').insert([payload]);
    if (!error) {
      await fetchData();
      setIsModalOpen(false);
    } else {
      alert("Erreur lors de l'enregistrement");
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce produit ?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Produits</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Nom</th>
                <th className="p-4">Prix</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-secondary/10">
                  <td className="p-4"><img src={p.image_url} className="w-10 h-10 object-cover rounded" /></td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">{p.price} DZD</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenModal(p)} className="p-2 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y">
          {products.map(p => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-4">
              <img src={p.image_url} className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="font-bold text-base">{p.name}</div>
                <div className="text-primary font-medium mt-1">{p.price} DZD</div>
              </div>
              <div className="flex flex-col gap-2">
                 <button onClick={() => handleOpenModal(p)} className="p-2 bg-secondary rounded-lg text-foreground flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                 <button onClick={() => handleDelete(p.id)} className="p-2 bg-destructive/10 rounded-lg text-destructive flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl p-4 md:p-6 rounded-2xl border shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editingProduct ? 'Modifier' : 'Ajouter'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm">Nom</label>
                  <input required className="w-full p-2 border rounded-lg bg-transparent" value={formData.name} onChange={e => handleNameChange(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm">URL Slug</label>
                  <input required className="w-full p-2 border rounded-lg bg-transparent text-muted-foreground text-xs" value={formData.slug} onChange={e => setFormData({...formData, slug: createSlug(e.target.value)})} placeholder="nom-du-produit" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm">Prix</label><input required type="number" className="w-full p-2 border rounded-lg bg-transparent" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm">Description</label>
                <textarea rows={3} className="w-full p-2 border rounded-lg bg-transparent text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Détails du produit..." />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Catégorie</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-background text-sm" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">-- Sans catégorie --</option>
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">المقاسات (Sizes)</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.sizes.map(s => <span key={s} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs flex items-center gap-1">{s}<X onClick={() => removeTag('sizes', s)} className="w-3 h-3 cursor-pointer" /></span>)}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 p-2 border rounded-lg bg-transparent" value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('sizes', sizeInput))} placeholder="Ex: XL, 42..." />
                    <button type="button" onClick={() => addTag('sizes', sizeInput)} className="bg-secondary px-3 rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">الألوان (Colors)</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.colors.map(c => <span key={c} className="bg-secondary px-2 py-1 rounded-md text-xs flex items-center gap-1">{c}<X onClick={() => removeTag('colors', c)} className="w-3 h-3 cursor-pointer" /></span>)}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 p-2 border rounded-lg bg-transparent" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('colors', colorInput))} placeholder="Ex: Noir, Rouge..." />
                    <button type="button" onClick={() => addTag('colors', colorInput)} className="bg-secondary px-3 rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">الصور</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {imageItems.map((item, idx) => (
                    <div key={item.id} className="relative aspect-square border rounded-lg overflow-hidden group">
                      <img src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity z-10">
                        <button type="button" onClick={() => handleMoveImage(idx, 'up')} className="bg-white p-1 rounded text-black text-xs font-bold">←</button>
                        <button type="button" onClick={() => handleRemoveImage(item.id)} className="bg-red-500 p-1 rounded text-white"><X className="w-3 h-3" /></button>
                        <button type="button" onClick={() => handleMoveImage(idx, 'down')} className="bg-white p-1 rounded text-black text-xs font-bold">→</button>
                      </div>
                      {formData.colors.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 opacity-100 z-20">
                          <select 
                            className="w-full bg-transparent text-white text-xs outline-none"
                            value={item.color || ''}
                            onChange={(e) => {
                               const selectedColor = e.target.value;
                               setImageItems(prev => prev.map(img => img.id === item.id ? { ...img, color: selectedColor || undefined } : img));
                            }}
                          >
                            <option value="" className="text-black text-xs">-- Couleur --</option>
                            {formData.colors.map(c => <option key={c} value={c} className="text-black text-xs">{c}</option>)}
                          </select>
                        </div>
                      )}
                      {idx === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-[8px] px-1 rounded z-20">رئيسية</span>}
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary"><Plus className="w-6 h-6" /></button>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFilesChange} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg">Annuler</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploading ? 'جاري الحفظ...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
