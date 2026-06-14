'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Image as ImageIcon, Upload, X, Save, Eye } from 'lucide-react';

interface HeroSettings {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string;
  button_link: string;
  image_url: string | null;
  text_color: 'white' | 'black';
  title_size: number;
  subtitle_size: number;
  button_size: number;
  is_active: boolean;
}

export default function AdminHeroPage() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: 'Découvrir',
    button_link: '/categories',
    image_url: '',
    text_color: 'white' as 'white' | 'black',
    title_size: 64,
    subtitle_size: 20,
    button_size: 16,
    is_active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchHero = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hero_settings')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      setHero(data);
      setFormData({
        title: data.title,
        subtitle: data.subtitle || '',
        button_text: data.button_text || 'Découvrir',
        button_link: data.button_link || '/categories',
        image_url: data.image_url || '',
        text_color: data.text_color || 'white',
        title_size: data.title_size || 64,
        subtitle_size: data.subtitle_size || 20,
        button_size: data.button_size || 16,
        is_active: data.is_active,
      });
      setImagePreview(data.image_url || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let finalImageUrl = formData.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }
    }

    const payload = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      button_text: formData.button_text,
      button_link: formData.button_link,
      image_url: finalImageUrl,
      text_color: formData.text_color,
      title_size: formData.title_size,
      subtitle_size: formData.subtitle_size,
      button_size: formData.button_size,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    let dbError;
    if (hero) {
      const { error } = await supabase.from('hero_settings').update(payload).eq('id', hero.id);
      dbError = error;
    } else {
      const { error } = await supabase.from('hero_settings').insert(payload);
      dbError = error;
    }

    setSaving(false);
    if (dbError) {
      alert("Erreur: " + dbError.message);
    } else {
      alert("Sauvegardé avec succès !");
      fetchHero();
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Eye className="w-8 h-8 text-primary" />
          Section Hero
        </h1>
        <p className="text-muted-foreground mt-1">Personnalisez la section d'accueil principale de votre boutique.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Image d'arrière-plan</h3>
          {imagePreview ? (
            <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden border shadow-sm group">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Hero preview" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setFormData({ ...formData, image_url: '' });
                }}
                className="absolute top-3 right-3 bg-black/60 text-white p-3 md:p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 md:h-64 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer transition-colors"
            >
              <Upload className="w-10 h-10 mb-3" />
              <span className="font-medium">Cliquez pour ajouter une image</span>
              <span className="text-sm mt-1">Recommandé : 1920x800px</span>
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

        {/* Text Fields */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Contenu</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Titre principal</label>
            <div className="flex gap-3">
              <input
                required
                className="flex-1 p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Nouvelle Collection Été 2025"
              />
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-muted-foreground">Taille</label>
                <input
                  type="number"
                  min="24"
                  max="120"
                  className="w-20 p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all text-center"
                  value={formData.title_size}
                  onChange={(e) => setFormData({ ...formData, title_size: Number(e.target.value) || 64 })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sous-titre (Optionnel)</label>
            <div className="flex gap-3">
              <textarea
                rows={2}
                className="flex-1 p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Ex: Découvrez les dernières tendances..."
              />
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-muted-foreground">Taille</label>
                <input
                  type="number"
                  min="12"
                  max="48"
                  className="w-20 p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all text-center"
                  value={formData.subtitle_size}
                  onChange={(e) => setFormData({ ...formData, subtitle_size: Number(e.target.value) || 20 })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Texte du bouton</label>
              <div className="flex gap-3">
                <input
                  className="flex-1 p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="Découvrir"
                />
                <div className="flex flex-col items-center gap-1">
                  <label className="text-xs text-muted-foreground">Taille</label>
                  <input
                    type="number"
                    min="12"
                    max="32"
                    className="w-20 p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all text-center"
                    value={formData.button_size}
                    onChange={(e) => setFormData({ ...formData, button_size: Number(e.target.value) || 16 })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lien du bouton</label>
              <input
                className="w-full p-3 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary transition-all"
                value={formData.button_link}
                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                placeholder="/categories"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur du texte</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, text_color: 'white' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                  formData.text_color === 'white'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                Blanc
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, text_color: 'black' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                  formData.text_color === 'black'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black border border-gray-700" />
                Noir
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Afficher la section Hero sur la page d'accueil
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
        </button>
      </form>
    </div>
  );
}
