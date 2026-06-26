import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getEntryById } from '../../api/entries'
import EntryCard from '../../components/EntryCard'
import type { Entry } from '../../types'

export default function EntryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getEntryById(id)
      .then(setEntry)
      .catch(err => setError(err.message || 'Entrada no encontrada'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
      >
        <ArrowLeft size={14} /> Volver
      </button>

      {loading && (
        <div className="text-center py-10 text-stone-400 dark:text-stone-500 text-sm">
          Cargando entrada...
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {entry && (
        <EntryCard
          entry={entry}
          onUpdate={() => getEntryById(id!).then(setEntry).catch(() => {})}
        />
      )}
    </div>
  )
}
