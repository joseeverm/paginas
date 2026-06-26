import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getJournals, createJournal, deleteJournal } from '../../api/journals'
import { getEntriesByJournal } from '../../api/entries'
import EntryCard from '../../components/EntryCard'
import { BookOpen, Plus, Trash2, PenTool, AlertTriangle } from 'lucide-react'
import type { Journal, Entry } from '../../types'

export default function JournalsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [journals, setJournals] = useState<Journal[]>([])
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [error, setError] = useState('')

  // Cargar diarios
  async function loadJournals() {
    setError('')
    try {
      const data = await getJournals()
      setJournals(data)

      // Determinar qué diario seleccionar al inicio
      const urlJournalId = searchParams.get('j')
      if (urlJournalId) {
        const found = data.find(j => j.id === urlJournalId)
        if (found) {
          setSelectedJournal(found)
          loadEntries(found.id)
          return
        }
      }

      if (data.length > 0) {
        setSelectedJournal(data[0])
        loadEntries(data[0].id)
      } else {
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar diarios')
      setLoading(false)
    }
  }

  // Cargar entradas por diario
  async function loadEntries(journalId: string) {
    setLoadingEntries(true)
    setError('')
    try {
      const entriesData = await getEntriesByJournal(journalId)
      setEntries(entriesData)
    } catch (err: any) {
      setError(err.message || 'Error al cargar entradas de este diario')
    } finally {
      setLoadingEntries(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJournals()
  }, [searchParams])

  // Seleccionar diario manualmente
  function handleSelectJournal(journal: Journal) {
    setSelectedJournal(journal)
    setSearchParams({ j: journal.id })
    loadEntries(journal.id)
  }

  // Crear diario
  async function handleCreateJournal(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setError('')
    try {
      const created = await createJournal(newTitle.trim(), newDescription.trim())
      setJournals(prev => [created, ...prev])
      setSelectedJournal(created)
      setSearchParams({ j: created.id })
      setNewTitle('')
      setNewDescription('')
      setShowCreateModal(false)
      loadEntries(created.id)
    } catch (err: any) {
      setError(err.message || 'Error al crear diario')
    }
  }

  // Eliminar diario
  async function confirmDeleteJournal() {
    if (!journalToDelete) return
    setDeleting(true)
    setError('')
    try {
      await deleteJournal(journalToDelete.id)
      const remaining = journals.filter(j => j.id !== journalToDelete.id)
      setJournals(remaining)
      setJournalToDelete(null)
      if (remaining.length > 0) {
        setSelectedJournal(remaining[0])
        setSearchParams({ j: remaining[0].id })
        loadEntries(remaining[0].id)
      } else {
        setSelectedJournal(null)
        setEntries([])
        setSearchParams({})
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar diario')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="text-xl font-medium text-stone-800 dark:text-stone-100">Mis diarios</h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Organiza tus pensamientos en diarios separados.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-xl hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
        >
          <Plus size={14} /> Nuevo diario
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-stone-400 dark:text-stone-500 text-sm">Cargando diarios...</div>
      ) : journals.length === 0 ? (
        <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-10 text-center space-y-4 bg-white/50 dark:bg-stone-900/20">
          <BookOpen className="mx-auto text-stone-300 dark:text-stone-700" size={32} />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">Aún no tienes ningún diario</h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs mx-auto">
              Crea un diario hoy mismo para empezar a plasmar tus pensamientos y reflexiones.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-lg"
          >
            Crear diario
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Columna Izquierda: Listado de Diarios */}
          <div className="md:col-span-1 space-y-2">
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
              Tus Diarios
            </label>
            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 pb-2 md:pb-0 scrollbar-none">
              {journals.map(j => {
                const isSelected = selectedJournal?.id === j.id
                return (
                  <button
                    key={j.id}
                    onClick={() => handleSelectJournal(j)}
                    className={`flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-sm transition shrink-0 md:shrink ${
                      isSelected
                        ? 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 shadow-sm border border-stone-200 dark:border-stone-800 font-medium'
                        : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/40 border border-transparent'
                    }`}
                  >
                    <span className="truncate max-w-[130px] md:max-w-none">{j.title}</span>
                    {isSelected && (
                      <Trash2
                        size={12}
                        onClick={(e) => {
                          e.stopPropagation()
                          setJournalToDelete(j)
                        }}
                        className="text-stone-400 hover:text-red-500 ml-2 cursor-pointer transition-colors"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Columna Derecha: Vista del Diario y sus Entradas */}
          <div className="md:col-span-3 space-y-4">
            {selectedJournal && (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm space-y-1">
                <h2 className="text-md font-medium text-stone-800 dark:text-stone-100">{selectedJournal.title}</h2>
                {selectedJournal.description && (
                  <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed">
                    {selectedJournal.description}
                  </p>
                )}
              </div>
            )}

            {loadingEntries ? (
              <div className="text-center py-10 text-stone-400 dark:text-stone-500 text-xs">Cargando entradas...</div>
            ) : entries.length === 0 ? (
              <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center space-y-3 bg-white/30 dark:bg-stone-900/10">
                <PenTool className="mx-auto text-stone-300 dark:text-stone-700" size={24} />
                <div className="space-y-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Este diario está vacío.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {entries.map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onUpdate={() => selectedJournal && loadEntries(selectedJournal.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {journalToDelete && (
        <div className="fixed inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500 dark:text-red-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  ¿Eliminar "{journalToDelete.title}"?
                </h3>
                <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed">
                  Se eliminarán permanentemente todas las entradas contenidas en este diario. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-900/60 px-5 py-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJournalToDelete(null)}
                disabled={deleting}
                className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteJournal}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Diario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Crear nuevo diario</h3>
            </div>
            <form onSubmit={handleCreateJournal}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Nombre del diario</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="ej: Reflexiones Nocturnas"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Descripción (opcional)</label>
                  <textarea
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="ej: Un lugar íntimo para registrar mis pensamientos antes de dormir."
                    rows={3}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none resize-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition"
                  />
                </div>
              </div>
              <div className="bg-stone-50 dark:bg-stone-900/60 p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-lg hover:bg-stone-700 dark:hover:bg-stone-200"
                >
                  Crear diario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
