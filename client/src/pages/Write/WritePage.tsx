import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Quote, Image as ImageIcon, Eye, Lock, Globe, Plus, Trash2 } from 'lucide-react'
import { getJournals, createJournal } from '../../api/journals'
import { createEntry } from '../../api/entries'
import { getDailyPrompt } from '../../api/prompts'
import type { Journal } from '../../types'

export default function WritePage() {
  const navigate = useNavigate()
  const [journals, setJournals] = useState<Journal[]>([])
  const [selectedJournalId, setSelectedJournalId] = useState('')
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'public' | 'excerpt'>('private')
  const [excerpt, setExcerpt] = useState('')
  const [dailyPrompt, setDailyPrompt] = useState<string | null>(null)
  
  // Imagenes
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creatingNewJournal, setCreatingNewJournal] = useState(false)
  const [newJournalTitle, setNewJournalTitle] = useState('')

  // Configuración de Tiptap
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[250px] py-4'
      }
    }
  })

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        // Cargar diario(s) — el diario personal se crea al registrarse
        const loadedJournals = await getJournals()
        setJournals(loadedJournals)
        if (loadedJournals.length > 0) {
          setSelectedJournalId(loadedJournals[0].id)
        }

        // Cargar pregunta del día
        try {
          const promptRes = await getDailyPrompt()
          if (promptRes && promptRes.question) {
            setDailyPrompt(promptRes.question)
          }
        } catch {
          // Ignorar silenciosamente si falla la carga del prompt
        }
      } catch (err: any) {
        setError('Error al cargar diarios iniciales')
      }
    }
    loadData()
  }, [])

  // Carga simulada de imagen
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError('')

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string)
      setUploadingImage(false)
    }
    reader.onerror = () => {
      setError('Error al leer el archivo de imagen')
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  // Guardar entrada
  async function handleSave() {
    setError('')
    const content = editor?.getHTML() || ''

    if (!selectedJournalId) {
      setError('Debes seleccionar un diario')
      return
    }

    if (!content || content === '<p></p>') {
      setError('El contenido del diario no puede estar vacío')
      return
    }

    if (visibility === 'excerpt' && !excerpt.trim()) {
      setError('Debes escribir un fragmento público para tu entrada')
      return
    }

    setLoading(true)
    try {
      await createEntry({
        journalId: selectedJournalId,
        title: title.trim() || undefined,
        content,
        excerpt: visibility === 'excerpt' ? excerpt.trim() : undefined,
        visibility,
        dailyPrompt: dailyPrompt || undefined,
        photoUrl: photoUrl || undefined
      })

      // Redirigir a inicio
      navigate('/home')
    } catch (err: any) {
      setError(err.message || 'Error al guardar la entrada')
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo diario de forma rápida
  async function handleCreateQuickJournal() {
    if (!newJournalTitle.trim()) return
    setError('')
    try {
      const newJournal = await createJournal(newJournalTitle.trim())
      setJournals(prev => [newJournal, ...prev])
      setSelectedJournalId(newJournal.id)
      setNewJournalTitle('')
      setCreatingNewJournal(false)
    } catch (err: any) {
      setError(err.message || 'Error al crear el diario')
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="text-xl font-medium text-stone-800 dark:text-stone-100">Nueva entrada</h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Escribe libremente y a tu ritmo.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-sm font-medium rounded-xl hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar entrada'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Pregunta del día */}
      {dailyPrompt && (
        <div className="p-4 bg-stone-100/70 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-800/60 rounded-xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500">Pregunta del día</span>
          <p className="text-sm font-serif text-stone-800 dark:text-stone-200 mt-1 italic">
            "{dailyPrompt}"
          </p>
          <button
            onClick={() => {
              if (editor) {
                editor.commands.insertContent(`<p><em>Pregunta del día: ${dailyPrompt}</em></p><p></p>`)
              }
            }}
            className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 underline mt-2"
          >
            Insertar pregunta al editor
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado izquierdo: Editor y título */}
        <div className="lg:col-span-2 space-y-4">
          {/* Título de la entrada */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título de la entrada (opcional)"
            className="w-full text-lg font-serif font-medium bg-transparent border-b border-stone-200 dark:border-stone-800 py-2 text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-700 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
          />

          {/* Menú de herramientas del Editor */}
          {editor && (
            <div className="flex items-center gap-1 p-1 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-lg">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition ${
                  editor.isActive('bold') ? 'text-stone-900 bg-stone-100 dark:text-stone-50 dark:bg-stone-800' : 'text-stone-400'
                }`}
                title="Negrita"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition ${
                  editor.isActive('italic') ? 'text-stone-900 bg-stone-100 dark:text-stone-50 dark:bg-stone-800' : 'text-stone-400'
                }`}
                title="Cursiva"
              >
                <Italic size={16} />
              </button>
              <span className="w-px h-6 bg-stone-200 dark:bg-stone-800 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition ${
                  editor.isActive('bulletList') ? 'text-stone-900 bg-stone-100 dark:text-stone-50 dark:bg-stone-800' : 'text-stone-400'
                }`}
                title="Lista con viñetas"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition ${
                  editor.isActive('orderedList') ? 'text-stone-900 bg-stone-100 dark:text-stone-50 dark:bg-stone-800' : 'text-stone-400'
                }`}
                title="Lista numerada"
              >
                <ListOrdered size={16} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition ${
                  editor.isActive('blockquote') ? 'text-stone-900 bg-stone-100 dark:text-stone-50 dark:bg-stone-800' : 'text-stone-400'
                }`}
                title="Cita"
              >
                <Quote size={16} />
              </button>
            </div>
          )}

          {/* Caja del Editor */}
          <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl px-4 min-h-[300px] shadow-sm">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Lado derecho: Metadatos, visibilidad y diario */}
        <div className="space-y-6">
          {/* Tarjeta de Diario */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm space-y-3">
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              ¿En qué diario guardar?
            </label>

            {!creatingNewJournal ? (
              <div className="flex gap-2">
                <select
                  value={selectedJournalId}
                  onChange={e => setSelectedJournalId(e.target.value)}
                  className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-sm py-2 px-3 rounded-lg focus:outline-none"
                >
                  {journals.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setCreatingNewJournal(true)}
                  className="p-2 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors"
                  title="Nuevo diario"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nombre del nuevo diario"
                  value={newJournalTitle}
                  onChange={e => setNewJournalTitle(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-sm py-2 px-3 rounded-lg focus:outline-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setCreatingNewJournal(false)}
                    className="px-2.5 py-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateQuickJournal}
                    className="px-2.5 py-1 text-xs bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-md font-medium"
                  >
                    Crear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta de Visibilidad */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm space-y-4">
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Privacidad y difusión
            </label>

            <div className="space-y-3">
              {/* Opción Privado */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                  className="mt-1 accent-stone-800 dark:accent-stone-100"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-stone-800 dark:text-stone-200">
                    <Lock size={13} className="text-stone-400" /> Privado
                  </span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">Solo tú podrás ver y leer esta entrada.</p>
                </div>
              </label>

              {/* Opción Público */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="mt-1 accent-stone-800 dark:accent-stone-100"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-stone-800 dark:text-stone-200">
                    <Globe size={13} className="text-stone-400" /> Público completo
                  </span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">Visible en tu perfil y en la comunidad.</p>
                </div>
              </label>

              {/* Opción Excerpt */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="visibility"
                  value="excerpt"
                  checked={visibility === 'excerpt'}
                  onChange={() => setVisibility('excerpt')}
                  className="mt-1 accent-stone-800 dark:accent-stone-100"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-stone-800 dark:text-stone-200">
                    <Eye size={13} className="text-stone-400" /> Fragmento público
                  </span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">Solo compartes un texto seleccionado; lo demás es privado.</p>
                </div>
              </label>
            </div>

            {/* Input para el Excerpt si está seleccionado */}
            {visibility === 'excerpt' && (
              <div className="space-y-1.5 border-t border-stone-100 dark:border-stone-800/80 pt-3">
                <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  Escribe el fragmento público:
                </label>
                <textarea
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="ej: 'Hoy caminé por el centro y descubrí un viejo café...'"
                  rows={3}
                  className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2 text-stone-800 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-700 focus:outline-none resize-none"
                />
                <p className="text-[10px] text-stone-400 italic">
                  Este bloque será el que descubran los lectores.
                </p>
              </div>
            )}
          </div>

          {/* Tarjeta de Foto */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm space-y-3">
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Foto de diario (opcional)
            </label>

            {!photoUrl ? (
              <div className="relative border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-6 text-center hover:bg-stone-50 dark:hover:bg-stone-950/40 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingImage}
                />
                <div className="flex flex-col items-center gap-1.5 text-stone-400">
                  <ImageIcon size={20} strokeWidth={1.5} />
                  <span className="text-xs">{uploadingImage ? 'Cargando...' : 'Subir foto'}</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 group">
                <img
                  src={photoUrl}
                  alt="Previsualización cabecera"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 bg-stone-900/80 hover:bg-stone-900 text-stone-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Quitar foto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
