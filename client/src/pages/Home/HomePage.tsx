import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { getHomeFeed } from '../../api/entries'
import { getArchiveEntry } from '../../api/prompts'
import EntryCard from '../../components/EntryCard'
import { useAuth } from '../../store/AuthContext'
import { BookOpen, Calendar, ChevronRight, PenTool } from 'lucide-react'
import type { Entry } from '../../types'

export default function HomePage() {
  const { user } = useAuth()
  const [feed, setFeed] = useState<Entry[]>([])
  const [archive, setArchive] = useState<(Entry & { journal?: { title: string } }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadFeedData() {
    setError('')
    try {
      const feedData = await getHomeFeed()
      setFeed(feedData)

      // Cargar archivo histórico
      try {
        const archiveData = await getArchiveEntry()
        setArchive(archiveData)
      } catch {
        // Ignorar silenciosamente si no hay entradas antiguas
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el inicio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-stone-800 dark:text-stone-100">Inicio</h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Bienvenido de nuevo, {user?.display_name || user?.username}.
          </p>
        </div>
        <RouterLink
          to="/escribir"
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-lg"
        >
          <PenTool size={12} /> Escribir
        </RouterLink>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* El Archivo: "Un día como hoy..." */}
      {archive && (
        <div className="bg-gradient-to-tr from-stone-100 to-stone-50/50 dark:from-stone-900 dark:to-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500">
              <Calendar size={12} /> Un día como hoy escribiste
            </span>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">
              Diario: {archive.journal?.title}
            </span>
          </div>

          <div className="space-y-2">
            {archive.title && (
              <h3 className="text-sm font-serif font-bold text-stone-800 dark:text-stone-100">
                {archive.title}
              </h3>
            )}
            <div
              className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 font-serif leading-relaxed"
              dangerouslySetInnerHTML={{ __html: archive.content }}
            />
          </div>

          <div className="pt-1">
            <RouterLink
              to={`/diarios?j=${archive.journal_id}`}
              className="text-xs font-medium text-stone-800 dark:text-stone-200 hover:text-stone-600 dark:hover:text-stone-300 flex items-center gap-0.5 group"
            >
              Ir a este diario <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </RouterLink>
          </div>
        </div>
      )}

      {/* Listado de Entradas (Feed) */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800" />
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-stone-100 dark:bg-stone-800 rounded" />
                    <div className="h-2 w-12 bg-stone-100 dark:bg-stone-800 rounded" />
                  </div>
                </div>
                <div className="h-3 w-16 bg-stone-100 dark:bg-stone-800 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-stone-100 dark:bg-stone-800 rounded" />
              <div className="space-y-1">
                <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded" />
                <div className="h-3 w-5/6 bg-stone-100 dark:bg-stone-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-10 text-center space-y-4 bg-white/50 dark:bg-stone-900/20">
          <BookOpen className="mx-auto text-stone-300 dark:text-stone-700" size={32} />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">Aún no hay lecturas</h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs mx-auto">
              Escribe tu primera entrada o dirígete a la sección de explorar para seguir autores de la comunidad.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <RouterLink
              to="/explorar"
              className="px-3.5 py-1.5 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              Explorar autores
            </RouterLink>
            <RouterLink
              to="/escribir"
              className="px-3.5 py-1.5 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-lg hover:bg-stone-700 dark:hover:bg-stone-200"
            >
              Escribir entrada
            </RouterLink>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {feed.map(entry => (
            <EntryCard key={entry.id} entry={entry} onUpdate={loadFeedData} preview />
          ))}
        </div>
      )}
    </div>
  )
}
