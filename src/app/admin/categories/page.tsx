'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Trash2, Edit2, Tags, Image as ImageIcon, Upload, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createSlug = (text: string) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (name: string) => {
    if (!editingCategory) {
      setFormData(prev => ({ ...prev, name, slug: createSlug(name) }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image_url: category.image_url || '',
      });
      setImagePreview(category.image_url || null);
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', image_url: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImageFile(null);
    if (imagePreview && !formData.image_url) {
        URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     if (!file.type.startsWith('image/')) return;
     setImageFile(file);
     setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let finalImageUrl = formData.image_url;

    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `categories/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);
        if (!uploadError) {
           const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
           finalImageUrl = urlData.publicUrl;
        }
    }

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image_url: finalImageUrl,
    };

    let dbError;
    if (editingCategory) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
      dbError = error;
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      dbError = error;
    }

    setUploading(false);

    if (dbError) {
       console.error(dbError);
       alert("Erreur lors de l'enregistrement: " + dbError.message);
    } else {
       handleCloseModal();
       fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert("Erreur lors de la suppression: " + error.message);
      } else {
        fetchCategories();
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Tags className="w-8 h-8 text-primary" />
            Catégories
          </h1>
          <p className="text-muted-foreground mt-1">Gérez les catégories de votre boutique.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Nom</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chargement...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucune catégorie trouvée.</td></tr>
              ) : (
                categories.map(c => (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      {c.image_url ? (
                        <img src={c.image_url} className="w-12 h-12 object-cover rounded-lg border" alt={c.name} />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground border">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-base">{c.name}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{c.slug}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenModal(c)} className="p-2 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : categories.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">Aucune catégorie trouvée.</div>
          ) : (
            categories.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                {c.image_url ? (
                  <img src={c.image_url} className="w-16 h-16 object-cover rounded-xl border shadow-sm" alt={c.name} />
                ) : (
                  <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground border shadow-sm shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base truncate">{c.name}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-1 truncate">{c.slug}</div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                   <button onClick={() => handleOpenModal(c)} className="p-2 bg-secondary rounded-lg text-foreground flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(c.id)} className="p-2 bg-destructive/10 rounded-lg text-destructive flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl p-6 rounded-3xl border shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Tags className="w-5 h-5 text-primary" />
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <input required className="w-full p-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all" value={formData.name} onChange={e => handleNameChange(e.target.value)} placeholder="Ex: T-shirts" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug (URL)</label>
                  <input required className="w-full p-3 border rounded-xl bg-background flex-1 outline-none transition-all text-muted-foreground text-sm font-mono" value={formData.slug} onChange={e => setFormData({...formData, slug: createSlug(e.target.value)})} placeholder="t-shirts" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image de couverture</label>
                
                {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm group">
                        <img src={imagePreview} className="w-full h-full object-cover" />
                        <button 
                            type="button" 
                            onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                                setFormData({...formData, image_url: ''});
                            }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                ) : (
                   <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer transition-colors"
                   >
                       <Upload className="w-8 h-8 mb-2" />
                       <span className="text-sm font-medium">Cliquez pour ajouter une image</span>
                   </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lien de l'image (URL) - Optionnel</label>
                <input className="w-full p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all text-sm" value={formData.image_url} onChange={e => {
                    setFormData({...formData, image_url: e.target.value});
                    if (e.target.value) setImagePreview(e.target.value);
                }} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optionnel)</label>
                <textarea rows={3} className="w-full p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description de la catégorie..." />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-xl border hover:bg-secondary transition-colors font-medium">
                  Annuler
                </button>
                <button type="submit" disabled={uploading} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
                  {uploading ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
