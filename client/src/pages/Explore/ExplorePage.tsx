import { useState, useEffect } from 'react'
import { getExploreFeed } from '../../api/entries'
import EntryCard from '../../components/EntryCard'
import { Search, Compass } from 'lucide-react'
import type { Entry } from '../../types'

export default function ExplorePage() {
  const [feed, setFeed] = useState<Entry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cargar feed
  async function loadExploreData(search?: string) {
    setError('')
    try {
      const exploreData = await getExploreFeed(search)
      setFeed(exploreData)
    } catch (err: any) {
      setError(err.message || 'Error al cargar exploración')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExploreData()
  }, [])

  // Buscar al enviar
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    loadExploreData(searchQuery.trim() || undefined)
  }

  // Buscar en tiempo real cuando se vacía
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearchQuery(val)
    if (!val.trim()) {
      setLoading(true)
      loadExploreData()
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-medium text-stone-800 dark:text-stone-100">Explorar</h1>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Descubre fragmentos, relatos y reflexiones de la comunidad.
        </p>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar diarios por palabras clave o etiquetas..."
          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-sm py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-700 transition"
        />
        <Search
          size={16}
          className="absolute left-3.5 top-3.5 text-stone-400 dark:text-stone-500"
        />
        {searchQuery && (
          <button
            type="submit"
            className="absolute right-3 top-2 px-2.5 py-1 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-lg"
          >
            Buscar
          </button>
        )}
      </form>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Resultados */}
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
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-10 text-center space-y-4 bg-white/50 dark:bg-stone-900/20">
          <Compass className="mx-auto text-stone-300 dark:text-stone-700" size={32} />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">No se encontraron entradas</h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs mx-auto">
              Intenta buscar otras palabras clave o explora las publicaciones destacadas de la comunidad colombiana.
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setLoading(true)
                loadExploreData()
              }}
              className="px-3.5 py-1.5 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium rounded-lg"
            >
              Restablecer búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {feed.map(entry => (
            <EntryCard key={entry.id} entry={entry} onUpdate={() => loadExploreData(searchQuery || undefined)} preview />
          ))}
        </div>
      )}
    </div>
  )
}
