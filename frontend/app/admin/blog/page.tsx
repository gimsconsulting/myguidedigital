'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { blogApi } from '@/lib/api';
import Link from 'next/link';

// ───── Types ─────
interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  category: string;
  tags: string | null;
  status: string;
  featured: boolean;
  readTime: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; firstName: string; lastName: string };
}

interface PexelsPhoto {
  id: number;
  photographer: string;
  alt: string;
  src: {
    original: string;
    large: string;
    large2x: string;
    medium: string;
    small: string;
    landscape: string;
    tiny: string;
  };
}

interface BlogCategoryType {
  id: string;
  slug: string;
  label: string;
  emoji: string;
  gradient: string;
  isActive: boolean;
  order: number;
}

// Catégories par défaut (fallback si DB vide)
const defaultCategories: BlogCategoryType[] = [
  { id: 'default-1', slug: 'conseils', label: 'Conseils', emoji: '💡', gradient: 'from-amber-500 to-orange-500', isActive: true, order: 0 },
  { id: 'default-2', slug: 'avantages', label: 'Avantages', emoji: '🚀', gradient: 'from-emerald-500 to-teal-500', isActive: true, order: 1 },
  { id: 'default-3', slug: 'technologie', label: 'Technologie', emoji: '🤖', gradient: 'from-violet-500 to-purple-500', isActive: true, order: 2 },
  { id: 'default-4', slug: 'temoignages', label: 'Témoignages', emoji: '⭐', gradient: 'from-pink-500 to-rose-500', isActive: true, order: 3 },
  { id: 'default-5', slug: 'actualites', label: 'Actualités', emoji: '📢', gradient: 'from-primary to-blue-500', isActive: true, order: 4 },
];

const gradientOptions = [
  { value: 'from-amber-500 to-orange-500', label: '🟠 Orange' },
  { value: 'from-emerald-500 to-teal-500', label: '🟢 Vert' },
  { value: 'from-violet-500 to-purple-500', label: '🟣 Violet' },
  { value: 'from-pink-500 to-rose-500', label: '🩷 Rose' },
  { value: 'from-primary to-blue-500', label: '🔵 Bleu' },
  { value: 'from-red-500 to-pink-500', label: '🔴 Rouge' },
  { value: 'from-cyan-500 to-blue-500', label: '🩵 Cyan' },
  { value: 'from-yellow-500 to-amber-500', label: '🟡 Jaune' },
  { value: 'from-primary to-pink-500', label: '💜 Brand' },
];

function getImageUrl(path: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d/.test(hostname)) {
      return `http://${hostname}:3001${path}`;
    }
    return `/api${path}`;
  }
  return path;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  // ───── States ─────
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  // Catégories dynamiques
  const [categories, setCategories] = useState<BlogCategoryType[]>(defaultCategories);
  const [editingCategory, setEditingCategory] = useState<BlogCategoryType | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catFormLabel, setCatFormLabel] = useState('');
  const [catFormEmoji, setCatFormEmoji] = useState('📁');
  const [catFormGradient, setCatFormGradient] = useState('from-primary to-pink-500');
  const [catSaving, setCatSaving] = useState(false);

  // Editor states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [category, setCategory] = useState('conseils');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [featured, setFeatured] = useState(false);
  const [readTime, setReadTime] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Pexels
  const [showPexels, setShowPexels] = useState(false);
  const [pexelsQuery, setPexelsQuery] = useState('');
  const [pexelsPhotos, setPexelsPhotos] = useState<PexelsPhoto[]>([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsTarget, setPexelsTarget] = useState<'thumbnail' | 'content'>('thumbnail');

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ───── Auth check ─────
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [hasHydrated, isAuthenticated, user]);

  if (!hasHydrated) return null;

  // ───── Load data ─────
  async function loadData() {
    try {
      setLoading(true);
      const [articlesRes, statsRes, categoriesRes] = await Promise.all([
        blogApi.adminList({ status: filterStatus || undefined, category: filterCategory || undefined }),
        blogApi.adminStats(),
        blogApi.adminGetCategories(),
      ]);
      setArticles(articlesRes.data.articles);
      setStats(statsRes.data);
      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Erreur chargement blog:', error);
    } finally {
      setLoading(false);
    }
  }

  // ───── Category management ─────
  function openNewCategory() {
    setEditingCategory(null);
    setCatFormLabel('');
    setCatFormEmoji('📁');
    setCatFormGradient('from-primary to-pink-500');
    setShowCategoryForm(true);
  }

  function openEditCategory(cat: BlogCategoryType) {
    setEditingCategory(cat);
    setCatFormLabel(cat.label);
    setCatFormEmoji(cat.emoji);
    setCatFormGradient(cat.gradient);
    setShowCategoryForm(true);
  }

  async function handleSaveCategory() {
    if (!catFormLabel.trim()) return;
    setCatSaving(true);
    try {
      if (editingCategory) {
        const res = await blogApi.adminUpdateCategory(editingCategory.id, {
          label: catFormLabel,
          emoji: catFormEmoji,
          gradient: catFormGradient,
        });
        setCategories(categories.map((c) => (c.id === editingCategory.id ? res.data : c)));
      } else {
        const res = await blogApi.adminCreateCategory({
          label: catFormLabel,
          emoji: catFormEmoji,
          gradient: catFormGradient,
        });
        setCategories([...categories, res.data]);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Erreur catégorie:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setCatSaving(false);
    }
  }

  async function handleToggleCategory(cat: BlogCategoryType) {
    try {
      const res = await blogApi.adminUpdateCategory(cat.id, { isActive: !cat.isActive });
      setCategories(categories.map((c) => (c.id === cat.id ? res.data : c)));
    } catch (error: any) {
      console.error('Erreur toggle catégorie:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  }

  async function handleDeleteCategory(cat: BlogCategoryType) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${cat.label}" ?`)) return;
    try {
      await blogApi.adminDeleteCategory(cat.id);
      setCategories(categories.filter((c) => c.id !== cat.id));
    } catch (error: any) {
      console.error('Erreur suppression catégorie:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  // ───── Reload on filter change ─────
  useEffect(() => {
    if (hasHydrated && isAuthenticated && user?.role === 'ADMIN' && view === 'list') {
      loadData();
    }
  }, [filterStatus, filterCategory]);

  // ───── Editor helpers ─────
  function resetEditor() {
    setTitle('');
    setExcerpt('');
    setContent('');
    setThumbnail(null);
    setCategory('conseils');
    setTags([]);
    setTagInput('');
    setStatus('DRAFT');
    setFeatured(false);
    setReadTime('');
    setMetaTitle('');
    setMetaDesc('');
    setEditingArticle(null);
    setSaveMessage('');
  }

  function openNewArticle() {
    resetEditor();
    setView('editor');
  }

  async function openEditArticle(article: BlogArticle) {
    try {
      const res = await blogApi.adminGetArticle(article.id);
      const a = res.data;
      setEditingArticle(a);
      setTitle(a.title);
      setExcerpt(a.excerpt);
      setContent(a.content);
      setThumbnail(a.thumbnail);
      setCategory(a.category);
      setTags(a.tags ? JSON.parse(a.tags) : []);
      setStatus(a.status as 'DRAFT' | 'PUBLISHED');
      setFeatured(a.featured);
      setReadTime(a.readTime || '');
      setMetaTitle(a.metaTitle || '');
      setMetaDesc(a.metaDesc || '');
      setSaveMessage('');
      setView('editor');
    } catch (error) {
      console.error('Erreur chargement article:', error);
    }
  }

  // ───── Save article ─────
  async function handleSave(publishStatus?: 'DRAFT' | 'PUBLISHED') {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setSaveMessage('❌ Titre, extrait et contenu sont requis');
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const articleData = {
        title,
        excerpt,
        content,
        thumbnail,
        category,
        tags,
        status: publishStatus || status,
        featured,
        readTime: readTime || estimateReadTime(content),
        metaTitle: metaTitle || title,
        metaDesc: metaDesc || excerpt.substring(0, 160),
      };

      if (editingArticle) {
        const res = await blogApi.adminUpdate(editingArticle.id, articleData);
        setEditingArticle(res.data);
        setSaveMessage('✅ Article mis à jour avec succès !');
      } else {
        const res = await blogApi.adminCreate(articleData);
        setEditingArticle(res.data);
        setSaveMessage('✅ Article créé avec succès !');
      }

      if (publishStatus) {
        setStatus(publishStatus);
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      setSaveMessage(`❌ Erreur: ${error.response?.data?.message || 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  }

  // ───── Delete article ─────
  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    try {
      await blogApi.adminDelete(id);
      setArticles(articles.filter((a) => a.id !== id));
      setSaveMessage('✅ Article supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  }

  // ───── Image upload ─────
  async function handleImageUpload(file: File, target: 'thumbnail' | 'content') {
    try {
      const res = await blogApi.adminUploadImage(file);
      const imageUrl = res.data.url;

      if (target === 'thumbnail') {
        setThumbnail(imageUrl);
      } else {
        insertImageInContent(imageUrl);
      }
    } catch (error: any) {
      console.error('Erreur upload image:', error);
      setSaveMessage('❌ Erreur lors de l\'upload de l\'image');
    }
  }

  // ───── Pexels search ─────
  async function handlePexelsSearch() {
    if (!pexelsQuery.trim()) return;
    setPexelsLoading(true);
    try {
      const res = await blogApi.adminPexelsSearch(pexelsQuery);
      setPexelsPhotos(res.data.photos);
    } catch (error: any) {
      console.error('Erreur Pexels:', error);
      setSaveMessage('❌ Erreur Pexels - Vérifiez la clé API');
    } finally {
      setPexelsLoading(false);
    }
  }

  function selectPexelsPhoto(photo: PexelsPhoto) {
    if (pexelsTarget === 'thumbnail') {
      setThumbnail(photo.src.large);
    } else {
      insertImageInContent(photo.src.large);
    }
    setShowPexels(false);
    setPexelsPhotos([]);
    setPexelsQuery('');
  }

  // ───── Insert image in content ─────
  function insertImageInContent(url: string) {
    const imageMarkdown = `\n![Image](${url})\n`;
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
      setContent(newContent);
    } else {
      setContent(content + imageMarkdown);
    }
  }

  // ───── Estimate read time ─────
  function estimateReadTime(text: string): string {
    const words = text.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min`;
  }

  // ───── Tag management ─────
  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  // ───── Render helpers ─────
  const getCategoryInfo = (catSlug: string) => categories.find((c) => c.slug === catSlug);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, 'thumbnail');
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={contentImageRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, 'content');
          e.target.value = '';
        }}
      />

      {/* ───── Header ───── */}
      <div className="bg-gradient-to-r from-[#0c0c18] via-[#12121f] to-[#0c0c18] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition-all"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  📝 Gestion du Blog
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  {view === 'list'
                    ? `${stats?.total || 0} articles • ${stats?.published || 0} publiés • ${stats?.draft || 0} brouillons`
                    : editingArticle
                      ? `Modification : ${editingArticle.title}`
                      : 'Nouvel article'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {view === 'editor' && (
                <button
                  onClick={() => {
                    setView('list');
                    resetEditor();
                    loadData();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white transition-all text-sm"
                >
                  ← Retour à la liste
                </button>
              )}
              {view === 'list' && (
                <button
                  onClick={openNewArticle}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all text-sm"
                >
                  + Nouvel article
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'list' ? renderList() : renderEditor()}
      </div>

      {/* ───── Modal Pexels ───── */}
      {showPexels && renderPexelsModal()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: Liste des articles
  // ═══════════════════════════════════════════════════════════
  function renderList() {
    return (
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total articles', value: stats?.total || 0, icon: '📝', gradient: 'from-primary to-pink-500' },
            { label: 'Publiés', value: stats?.published || 0, icon: '✅', gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Brouillons', value: stats?.draft || 0, icon: '📋', gradient: 'from-amber-500 to-orange-500' },
            { label: 'À la une', value: stats?.featured || 0, icon: '⭐', gradient: 'from-violet-500 to-purple-500' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center text-lg`}>
                  {kpi.icon}
                </div>
                <p className="text-white/40 text-sm">{kpi.label}</p>
              </div>
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-2 text-sm focus:border-primary/50 focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="PUBLISHED">Publiés</option>
            <option value="DRAFT">Brouillons</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-2 text-sm focus:border-primary/50 focus:outline-none"
          >
            <option value="">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table articles */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="text-white/40 mt-4">Chargement des articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <p className="text-5xl mb-4">📝</p>
            <h3 className="text-xl font-bold text-white mb-2">Aucun article</h3>
            <p className="text-white/40 mb-6">Créez votre premier article de blog !</p>
            <button
              onClick={openNewArticle}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              + Créer un article
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => {
              const catInfo = getCategoryInfo(article.category);
              return (
                <div
                  key={article.id}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.03]">
                      {article.thumbnail ? (
                        <img
                          src={getImageUrl(article.thumbnail)}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${catInfo?.gradient || 'from-primary to-pink-500'} flex items-center justify-center text-2xl`}>
                          {catInfo?.emoji || '📝'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            article.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {article.status === 'PUBLISHED' ? '✅ Publié' : '📋 Brouillon'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-white/[0.03] text-white/50 border border-white/[0.06]">
                          {catInfo?.emoji} {catInfo?.label}
                        </span>
                        {article.featured && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            ⭐ À la une
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-lg truncate">{article.title}</h3>
                      <p className="text-white/40 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                        <span>📅 {new Date(article.updatedAt).toLocaleDateString('fr-FR')}</span>
                        {article.readTime && <span>⏱️ {article.readTime}</span>}
                        <span>✍️ {article.author.firstName || 'Admin'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditArticle(article)}
                        className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: Éditeur d'article
  // ═══════════════════════════════════════════════════════════
  function renderEditor() {
    return (
      <div className="space-y-6">
        {/* Save message */}
        {saveMessage && (
          <div
            className={`px-4 py-3 rounded-xl text-sm font-medium ${
              saveMessage.startsWith('✅')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ───── Colonne principale (2/3) ───── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Titre */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <label className="block text-white/60 text-sm font-medium mb-2">Titre de l&apos;article *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Saisissez un titre accrocheur..."
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-lg placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-all"
              />
            </div>

            {/* Extrait */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <label className="block text-white/60 text-sm font-medium mb-2">Extrait / Résumé *</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Un résumé accrocheur qui apparaîtra sur la carte de l'article..."
                rows={3}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-all resize-none"
              />
              <p className="text-white/20 text-xs mt-1">{excerpt.length}/300 caractères</p>
            </div>

            {/* Contenu */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/60 text-sm font-medium">Contenu de l&apos;article *</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => contentImageRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15] transition-all text-xs"
                    title="Uploader une image"
                  >
                    📷 Image locale
                  </button>
                  <button
                    onClick={() => {
                      setPexelsTarget('content');
                      setShowPexels(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15] transition-all text-xs"
                    title="Chercher sur Pexels"
                  >
                    🔍 Pexels
                  </button>
                  {/* Toolbar formatage */}
                  <button
                    onClick={() => insertFormatting('## ')}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white transition-all text-xs font-bold"
                    title="Titre H2"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => insertFormatting('### ')}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white transition-all text-xs font-bold"
                    title="Titre H3"
                  >
                    H3
                  </button>
                  <button
                    onClick={() => wrapFormatting('**')}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white transition-all text-xs font-bold"
                    title="Gras"
                  >
                    B
                  </button>
                  <button
                    onClick={() => wrapFormatting('*')}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white transition-all text-xs italic"
                    title="Italique"
                  >
                    I
                  </button>
                  <button
                    onClick={() => insertFormatting('- ')}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white transition-all text-xs"
                    title="Liste"
                  >
                    • Liste
                  </button>
                  <button
                    onClick={() => insertFormatting('> ')}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white transition-all text-xs"
                    title="Citation"
                  >
                    &ldquo; Citation
                  </button>
                </div>
              </div>
              <textarea
                ref={contentTextareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre article ici... Vous pouvez utiliser le Markdown pour le formatage.&#10;&#10;## Titre de section&#10;&#10;Votre texte ici...&#10;&#10;**Texte en gras** et *texte en italique*&#10;&#10;- Élément de liste&#10;- Autre élément&#10;&#10;> Citation&#10;&#10;![Description](url-de-l-image)"
                rows={20}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-all resize-y font-mono text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-white/20 text-xs">
                  Format Markdown • {content.split(/\s+/).filter(Boolean).length} mots • Temps de lecture estimé : {estimateReadTime(content)}
                </p>
              </div>
            </div>
          </div>

          {/* ───── Sidebar (1/3) ───── */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Publication</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSave('DRAFT')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 hover:bg-white/[0.06] transition-all text-sm font-medium disabled:opacity-50"
                >
                  {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder en brouillon'}
                </button>
                <button
                  onClick={() => handleSave('PUBLISHED')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all text-sm disabled:opacity-50"
                >
                  {saving ? '⏳ Publication...' : '🚀 Publier l\'article'}
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/[0.03] text-primary focus:ring-primary/30"
                  />
                  <span className="text-white/60 text-sm">⭐ Mettre à la une</span>
                </label>
              </div>
            </div>

            {/* Vignette / Thumbnail */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Vignette de l&apos;article</h3>
              {thumbnail ? (
                <div className="relative group">
                  <img
                    src={thumbnail.startsWith('http') ? thumbnail : getImageUrl(thumbnail)}
                    alt="Vignette"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button
                      onClick={() => setThumbnail(null)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs hover:bg-red-500 transition-all"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-40 bg-white/[0.03] border-2 border-dashed border-white/[0.1] rounded-xl flex flex-col items-center justify-center gap-2">
                  <p className="text-white/30 text-sm">Aucune vignette</p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15] transition-all text-xs text-center"
                >
                  📷 Upload
                </button>
                <button
                  onClick={() => {
                    setPexelsTarget('thumbnail');
                    setShowPexels(true);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15] transition-all text-xs text-center"
                >
                  🔍 Pexels
                </button>
              </div>
            </div>

            {/* Catégorie */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Catégorie *</h3>
                <button
                  onClick={openNewCategory}
                  className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-medium"
                  title="Ajouter une catégorie"
                >
                  + Ajouter
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`rounded-xl text-sm transition-all flex items-center group ${
                      !cat.isActive ? 'opacity-40' : ''
                    } ${
                      category === cat.slug
                        ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                        : 'bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15]'
                    }`}
                  >
                    {/* Zone cliquable pour sélectionner */}
                    <button
                      onClick={() => cat.isActive && setCategory(cat.slug)}
                      className={`flex-1 flex items-center gap-2 px-4 py-2.5 text-left ${!cat.isActive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={!cat.isActive}
                    >
                      <span>{cat.emoji}</span>
                      <span className="flex-1">{cat.label}</span>
                      {!cat.isActive && <span className="text-[10px] opacity-60">inactif</span>}
                    </button>

                    {/* Actions : toggle + edit + delete */}
                    <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Toggle actif/inactif */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleCategory(cat); }}
                        className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                        style={{ backgroundColor: cat.isActive ? '#22c55e' : '#374151' }}
                        title={cat.isActive ? 'Désactiver' : 'Activer'}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform"
                          style={{ left: cat.isActive ? '18px' : '2px' }}
                        />
                      </button>
                      {/* Crayon modifier */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Modifier"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {/* Poubelle supprimer */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Supprimer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal formulaire catégorie */}
              {showCategoryForm && (
                <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.1] rounded-xl space-y-3">
                  <h4 className="text-white/70 text-sm font-medium">
                    {editingCategory ? '✏️ Modifier la catégorie' : '➕ Nouvelle catégorie'}
                  </h4>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Nom</label>
                    <input
                      type="text"
                      value={catFormLabel}
                      onChange={(e) => setCatFormLabel(e.target.value)}
                      placeholder="Ex: Tourisme"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Emoji</label>
                    <input
                      type="text"
                      value={catFormEmoji}
                      onChange={(e) => setCatFormEmoji(e.target.value)}
                      placeholder="📁"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Couleur</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {gradientOptions.map((g) => (
                        <button
                          key={g.value}
                          onClick={() => setCatFormGradient(g.value)}
                          className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
                            catFormGradient === g.value
                              ? `bg-gradient-to-r ${g.value} text-white shadow-lg ring-2 ring-white/30`
                              : 'bg-white/[0.03] border border-white/[0.08] text-white/50 hover:border-white/[0.15]'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="pt-2">
                    <label className="text-white/40 text-xs mb-1 block">Aperçu</label>
                    <div className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${catFormGradient} text-white text-sm flex items-center gap-2 shadow-lg`}>
                      <span>{catFormEmoji}</span>
                      <span>{catFormLabel || 'Nom...'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveCategory}
                      disabled={catSaving || !catFormLabel.trim()}
                      className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {catSaving ? '⏳ ...' : editingCategory ? '✅ Modifier' : '✅ Créer'}
                    </button>
                    <button
                      onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                      className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white text-sm transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Tags</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Ajouter un tag..."
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-all text-sm"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60 text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-white/30 hover:text-red-400 ml-1">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Temps de lecture */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Temps de lecture</h3>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder={estimateReadTime(content) || '5 min'}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
              />
              <p className="text-white/20 text-xs mt-1">Estimé auto : {estimateReadTime(content)}</p>
            </div>

            {/* SEO */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">🔍 SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Titre SEO...'}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Meta Description</label>
                  <textarea
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    placeholder={excerpt.substring(0, 160) || 'Description SEO...'}
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:border-primary/50 focus:outline-none resize-none"
                  />
                  <p className="text-white/20 text-xs mt-1">{(metaDesc || excerpt).length}/160</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───── Format helpers ─────
  function insertFormatting(prefix: string) {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + prefix + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
    }, 0);
  }

  function wrapFormatting(wrapper: string) {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + wrapper + selectedText + wrapper + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + wrapper.length;
      textarea.selectionEnd = end + wrapper.length;
    }, 0);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: Modal Pexels
  // ═══════════════════════════════════════════════════════════
  function renderPexelsModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-[#12121f] border border-white/[0.08] rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🔍 Recherche Pexels
              </h3>
              <p className="text-white/40 text-xs mt-0.5">
                {pexelsTarget === 'thumbnail' ? 'Sélectionnez une vignette' : 'Insérez une image dans le contenu'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowPexels(false);
                setPexelsPhotos([]);
                setPexelsQuery('');
              }}
              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          {/* Search bar */}
          <div className="px-6 py-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={pexelsQuery}
                onChange={(e) => setPexelsQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePexelsSearch()}
                placeholder="Rechercher des photos (ex: hotel, travel, cooking, nature...)"
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={handlePexelsSearch}
                disabled={pexelsLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
              >
                {pexelsLoading ? '⏳' : '🔍 Rechercher'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {pexelsLoading ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-white/40 mt-3 text-sm">Recherche en cours...</p>
              </div>
            ) : pexelsPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {pexelsPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => selectPexelsPhoto(photo)}
                    className="group relative rounded-xl overflow-hidden aspect-[4/3] hover:ring-2 hover:ring-primary/50 transition-all"
                  >
                    <img
                      src={photo.src.medium}
                      alt={photo.alt || 'Photo Pexels'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs truncate">📸 {photo.photographer}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-5xl mb-3">📷</p>
                <p className="text-white/40 text-sm">Recherchez des photos libres de droits sur Pexels</p>
              </div>
            )}
          </div>

          {/* Footer credit */}
          <div className="px-6 py-3 border-t border-white/[0.06] text-center">
            <p className="text-white/20 text-xs">Photos fournies par <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Pexels</a></p>
          </div>
        </div>
      </div>
    );
  }
}
