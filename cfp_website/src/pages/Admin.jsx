/**
 * Admin.jsx — Community Fridge Project CMS Portal
 * ─────────────────────────────────────────────────────────────────────────────
 * Password-protected admin portal for Karen and team.
 *
 * Features:
 *   • Login gate (password from site.config.js → ADMIN_CONFIG.password)
 *   • News & Events: add, edit, delete, publish/unpublish articles
 *   • Volunteer Slots: update filled counts in real-time
 *   • Page Content: edit mission statement, hero text, donate copy
 *   • All data persisted to localStorage (key: ADMIN_CONFIG.contentKey)
 *
 * ⚠️ To wire to Supabase: replace localStorage reads/writes with
 *    Supabase client calls. The shape of `content` state maps directly
 *    to a `site_content` table structure.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LogIn, LogOut, Newspaper, Users, FileText, BarChart2,
  Plus, Trash2, Edit3, Eye, EyeOff, Save, CheckCircle,
  AlertTriangle, ArrowLeft, Settings,
} from 'lucide-react'
import { ADMIN_CONFIG, VOLUNTEER_SLOTS, DEFAULT_NEWS, HOME, DONATE } from '../config/site.config'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function loadContent() {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG.contentKey)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return {
    news:    [...DEFAULT_NEWS],
    slots:   VOLUNTEER_SLOTS.map(s => ({ ...s })),
    pages: {
      missionBody:  HOME.mission.body,
      heroHeadline: HOME.hero.headline,
      heroSub:      HOME.hero.subheadline,
      donateIntro:  DONATE.intro,
    },
  }
}

function saveContent(content) {
  localStorage.setItem(ADMIN_CONFIG.contentKey, JSON.stringify(content))
}

function generateId() {
  return Date.now() + Math.random().toString(36).slice(2)
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_CONFIG.password) {
      sessionStorage.setItem(ADMIN_CONFIG.sessionKey, '1')
      onLogin()
    } else {
      setErr(true)
      setPw('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-800
                    flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center
                          mx-auto mb-4">
            <span className="text-3xl" role="img" aria-label="Fridge">🥦</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Community Fridge Project</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-pw" className="form-label">Password</label>
            <input
              id="admin-pw" type="password" autoFocus required
              value={pw} onChange={e => { setPw(e.target.value); setErr(false) }}
              placeholder="Enter admin password"
              className={`form-input ${err ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {err && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle size={13} /> Incorrect password. Please try again.
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3.5">
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to website
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── NAV SIDEBAR ──────────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard',       icon: BarChart2 },
  { id: 'news',      label: 'News & Events',   icon: Newspaper },
  { id: 'slots',     label: 'Volunteer Slots', icon: Users },
  { id: 'pages',     label: 'Page Content',    icon: FileText },
]

function AdminNav({ activeTab, onTab, onLogout }) {
  return (
    <aside className="w-full md:w-60 bg-gray-900 text-gray-300 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🥦</span>
          </div>
          <div className="leading-none">
            <p className="text-white font-bold text-sm">CFP Admin</p>
            <p className="text-gray-500 text-xs">Content Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {ADMIN_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold
                          transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full md:w-60 p-4 border-t border-gray-800 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-sm
                     py-2 px-4 rounded-lg hover:bg-gray-800 transition-all"
        >
          <ArrowLeft size={14} /> View Website
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm
                     py-2 px-4 rounded-lg hover:bg-gray-800 transition-all"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({ content }) {
  const published = content.news.filter(a => a.published).length
  const events    = content.news.filter(a => a.type === 'event').length
  const slotsOpen = content.slots.filter(s => s.filled < s.optimal).length

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Published Articles', value: published, icon: '📰', color: 'brand' },
          { label: 'Upcoming Events',    value: events,    icon: '📅', color: 'blue' },
          { label: 'Volunteer Slots',    value: content.slots.length, icon: '👥', color: 'purple' },
          { label: 'Slots Needing Help', value: slotsOpen, icon: '🚨', color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="card text-center">
            <div className="text-3xl mb-2" role="img" aria-hidden="true">{stat.icon}</div>
            <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
        <h3 className="font-bold text-brand-800 mb-2 flex items-center gap-2">
          <Settings size={16} /> Quick Start Guide
        </h3>
        <ul className="text-sm text-brand-700 space-y-1 list-disc list-inside">
          <li>Use <strong>News &amp; Events</strong> to post updates, announcements, and upcoming events.</li>
          <li>Use <strong>Volunteer Slots</strong> to update how many volunteers are signed up for each activity.</li>
          <li>Use <strong>Page Content</strong> to edit the mission statement and homepage copy.</li>
          <li>All changes save automatically to this browser. Connect Supabase to sync across devices.</li>
        </ul>
      </div>
    </div>
  )
}

// ─── NEWS TAB ─────────────────────────────────────────────────────────────────
const BLANK_ARTICLE = {
  id: null, type: 'news', title: '', date: '', excerpt: '',
  body: '', author: 'Karen', published: false,
}

function NewsTab({ content, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(BLANK_ARTICLE)
  const [saved, setSaved]     = useState(false)

  const openNew  = () => { setForm({ ...BLANK_ARTICLE, date: new Date().toISOString().split('T')[0] }); setEditing('new') }
  const openEdit = (article) => { setForm({ ...article }); setEditing(article.id) }
  const closeForm = () => { setEditing(null); setForm(BLANK_ARTICLE) }

  const handleSave = () => {
    let updated
    if (editing === 'new') {
      updated = [...content.news, { ...form, id: generateId() }]
    } else {
      updated = content.news.map(a => a.id === form.id ? { ...form } : a)
    }
    onChange({ ...content, news: updated })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    closeForm()
  }

  const handleDelete = (id) => {
    if (!confirm('Delete this article?')) return
    onChange({ ...content, news: content.news.filter(a => a.id !== id) })
  }

  const togglePublish = (id) => {
    onChange({
      ...content,
      news: content.news.map(a => a.id === id ? { ...a, published: !a.published } : a),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">News &amp; Events</h2>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> New Post
        </button>
      </div>

      {/* Article form */}
      {editing !== null && (
        <div className="card mb-8 border-brand-300">
          <h3 className="font-bold text-lg mb-4 text-gray-900">
            {editing === 'new' ? 'Create New Post' : 'Edit Post'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Type</label>
              <select name="type" value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="form-input">
                <option value="news">News Article</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="form-input" />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Title *</label>
            <input type="text" value={form.title} placeholder="Article title..."
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="form-input" />
          </div>
          <div className="mb-4">
            <label className="form-label">Excerpt (shown on News page)</label>
            <textarea rows={2} value={form.excerpt} placeholder="Short summary..."
              onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
              className="form-input resize-none" />
          </div>
          <div className="mb-4">
            <label className="form-label">Full Body</label>
            <textarea rows={5} value={form.body} placeholder="Full article text..."
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              className="form-input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Author</label>
              <input type="text" value={form.author}
                onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                className="form-input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published}
                  onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500" />
                <span className="text-sm font-semibold text-gray-700">Publish immediately</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary text-sm px-5 py-2">
              <Save size={14} /> Save Post
            </button>
            <button onClick={closeForm} className="btn-secondary text-sm px-5 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Article list */}
      <div className="space-y-3">
        {content.news.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">No posts yet. Create your first one!</p>
        )}
        {content.news.map(article => (
          <div key={article.id}
               className={`flex items-center justify-between p-4 rounded-xl border
                           ${article.published ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
            <div className="min-w-0 flex-1 mr-4">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${article.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}`}>
                  {article.type === 'event' ? '📅 Event' : '📰 News'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                  ${article.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {article.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="font-semibold text-gray-900 truncate text-sm">{article.title || 'Untitled'}</p>
              <p className="text-xs text-gray-400">{article.date}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => togglePublish(article.id)}
                      title={article.published ? 'Unpublish' : 'Publish'}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                {article.published ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => openEdit(article)} title="Edit"
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Edit3 size={16} />
              </button>
              <button onClick={() => handleDelete(article.id)} title="Delete"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── VOLUNTEER SLOTS TAB ──────────────────────────────────────────────────────
function SlotsTab({ content, onChange }) {
  const [saved, setSaved] = useState(false)

  const updateFilled = (id, val) => {
    onChange({
      ...content,
      slots: content.slots.map(s =>
        s.id === id ? { ...s, filled: Math.max(0, Math.min(parseInt(val) || 0, s.max)) } : s
      ),
    })
  }

  const handleSaveAll = () => {
    saveContent(content)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Volunteer Slots</h2>
        <button onClick={handleSaveAll} className="btn-primary text-sm px-4 py-2">
          {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save All</>}
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Update the <strong>filled</strong> count for each activity as volunteers sign up.
        These numbers appear live on the Volunteer Dashboard.
      </p>
      <div className="space-y-3">
        {content.slots.map(slot => {
          const pct = slot.filled / slot.optimal
          const status = slot.filled >= slot.max ? 'full' : pct >= 0.6 ? 'warn' : 'open'
          return (
            <div key={slot.id}
                 className={`flex items-center gap-4 p-4 rounded-xl border
                   ${status === 'full' ? 'border-red-200 bg-red-50'
                     : status === 'warn' ? 'border-yellow-200 bg-yellow-50'
                     : 'border-brand-200 bg-brand-50'}`}>
              <span className="text-2xl flex-shrink-0">{slot.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{slot.activity}</p>
                <p className="text-xs text-gray-500">{slot.day} · max {slot.max}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <label className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  Filled:
                </label>
                <input
                  type="number" min={0} max={slot.max}
                  value={slot.filled}
                  onChange={e => updateFilled(slot.id, e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm
                             font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-gray-500">/ {slot.optimal}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── PAGE CONTENT TAB ─────────────────────────────────────────────────────────
function PagesTab({ content, onChange }) {
  const [saved, setSaved] = useState(false)
  const pages = content.pages

  const update = (key, val) => onChange({ ...content, pages: { ...pages, [key]: val } })

  const handleSave = () => {
    saveContent(content)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Page Content</h2>
        <button onClick={handleSave} className="btn-primary text-sm px-4 py-2">
          {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Edit key copy blocks used across the website. Changes update on the live site immediately after saving.
      </p>
      <div className="space-y-6">
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">🏠 Home Page</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Hero Headline</label>
              <input type="text" value={pages.heroHeadline}
                onChange={e => update('heroHeadline', e.target.value)}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Hero Subheadline</label>
              <input type="text" value={pages.heroSub}
                onChange={e => update('heroSub', e.target.value)}
                className="form-input" />
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">🌱 Mission Statement</h3>
          <div>
            <label className="form-label">Mission Body Text</label>
            <textarea rows={5} value={pages.missionBody}
              onChange={e => update('missionBody', e.target.value)}
              className="form-input resize-none" />
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">💚 Donate Page Intro</h3>
          <div>
            <label className="form-label">Intro Paragraph</label>
            <textarea rows={4} value={pages.donateIntro}
              onChange={e => update('donateIntro', e.target.value)}
              className="form-input resize-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ADMIN PORTAL (main export) ───────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed]   = useState(
    () => !!sessionStorage.getItem(ADMIN_CONFIG.sessionKey)
  )
  const [activeTab, setTab]   = useState('dashboard')
  const [content, setContent] = useState(loadContent)
  const [saveBanner, setBanner] = useState(false)

  // Auto-save to localStorage whenever content changes
  useEffect(() => {
    saveContent(content)
    setBanner(true)
    const t = setTimeout(() => setBanner(false), 1800)
    return () => clearTimeout(t)
  }, [content])

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_CONFIG.sessionKey)
    setAuthed(false)
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Sidebar */}
      <AdminNav activeTab={activeTab} onTab={setTab} onLogout={handleLogout} />

      {/* Content area */}
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-auto">
        {/* Auto-save banner */}
        {saveBanner && (
          <div className="fixed top-4 right-4 z-50 bg-brand-600 text-white text-sm
                          px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
            <CheckCircle size={14} /> Changes saved
          </div>
        )}

        {activeTab === 'dashboard' && <DashboardTab content={content} />}
        {activeTab === 'news'      && <NewsTab content={content} onChange={setContent} />}
        {activeTab === 'slots'     && <SlotsTab content={content} onChange={setContent} />}
        {activeTab === 'pages'     && <PagesTab content={content} onChange={setContent} />}
      </main>
    </div>
  )
}
