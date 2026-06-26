import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Trash2, Calendar, Lock, Globe, Eye, User as UserIcon, ArrowRight } from 'lucide-react'
import { createComment, deleteComment, toggleReaction } from '../api/interactions'
import { deleteEntry } from '../api/entries'
import { useAuth } from '../store/AuthContext'
import type { Entry } from '../types'

interface EntryCardProps {
  entry: Entry
  onUpdate?: () => void
  preview?: boolean
}

const REACTION_TYPES = [
  { type: 'me_ha_pasado', emoji: '🤔', label: 'Me ha pasado' },
  { type: 'me_encanta', emoji: '❤️', label: 'Me encanta' },
  { type: 'te_entiendo', emoji: '🫂', label: 'Te entiendo' },
  { type: 'fuerza_amigo', emoji: '💪', label: 'Fuerza, amigo' },
  { type: 'me_llego', emoji: '✨', label: 'Me llegó' }
]

export default function EntryCard({ entry, onUpdate, preview = false }: EntryCardProps) {
  const { user: currentUser } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentsList, setCommentsList] = useState<any[]>(entry.comments || [])
  const [reactionsList, setReactionsList] = useState<any[]>(entry.reactions || [])
  const [error, setError] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUser && entry.user_id === currentUser.id
  
  // Agrupar reacciones por tipo
  const getReactionCount = (type: string) => {
    return reactionsList.filter(r => r.type === type).length
  }

  // Verificar si el usuario actual reaccionó con este tipo
  const hasUserReacted = (type: string) => {
    return currentUser && reactionsList.some(r => r.type === type && r.user_id === currentUser.id)
  }

  // Formatear fecha colombiana
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Manejar reacción
  async function handleReact(type: string) {
    if (!currentUser) return
    setError('')
    try {
      const res = await toggleReaction(entry.id, type)
      if (res.action === 'created') {
        // Añadir a la lista local
        setReactionsList(prev => [...prev, { ...res.reaction, user_id: currentUser.id }])
      } else if (res.action === 'removed') {
        // Eliminar de la lista local
        setReactionsList(prev => prev.filter(r => !(r.user_id === currentUser.id && r.entry_id === entry.id)))
      } else if (res.action === 'updated') {
        // Actualizar tipo
        setReactionsList(prev =>
          prev.map(r => (r.user_id === currentUser.id ? { ...r, type } : r))
        )
      }
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.message || 'Error al reaccionar')
    }
  }

  // Guardar comentario
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return
    setError('')
    setSubmittingComment(true)
    try {
      const added = await createComment(entry.id, newComment.trim())
      setCommentsList(prev => [...prev, added])
      setNewComment('')
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.message || 'Error al comentar')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Eliminar comentario
  async function handleDeleteComment(commentId: string) {
    if (!window.confirm('¿Seguro que deseas eliminar este comentario?')) return
    setError('')
    try {
      await deleteComment(commentId)
      setCommentsList(prev => prev.filter(c => c.id !== commentId))
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.message || 'Error al eliminar comentario')
    }
  }

  // Eliminar entrada
  async function handleDeleteEntry() {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta entrada de tu diario?')) return
    setIsDeleting(true)
    try {
      await deleteEntry(entry.id)
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.message || 'Error al eliminar entrada')
      setIsDeleting(false)
    }
  }

  return (
    <article className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
      
      {/* Cabecera de foto si existe */}
      {entry.photo?.url && (
        <div className="w-full h-48 overflow-hidden border-b border-stone-100 dark:border-stone-800/60">
          <img
            src={entry.photo.url}
            alt="Cabecera entrada"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="p-5 space-y-4">
        {/* Metadatos superiores */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {entry.user?.avatar_url ? (
              <img
                src={entry.user.avatar_url}
                alt={entry.user.username}
                className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-stone-800"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                <UserIcon size={14} />
              </div>
            )}
            <div>
              <Link
                to={`/perfil?u=${entry.user?.username}`}
                className="text-sm font-medium text-stone-800 dark:text-stone-100 hover:underline"
              >
                {entry.user?.display_name || entry.user?.username}
              </Link>
              <span className="text-xs text-stone-400 dark:text-stone-500 block">
                @{entry.user?.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de privacidad (Solo dueño) */}
            {isOwner && (
              <span
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                title="Visibilidad"
              >
                {entry.visibility === 'private' && (
                  <>
                    <Lock size={10} /> Privado
                  </>
                )}
                {entry.visibility === 'public' && (
                  <>
                    <Globe size={10} /> Público
                  </>
                )}
                {entry.visibility === 'excerpt' && (
                  <>
                    <Eye size={10} /> Fragmento
                  </>
                )}
              </span>
            )}
            
            <span className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <Calendar size={12} /> {formatDate(entry.created_at)}
            </span>
          </div>
        </div>

        {/* Título */}
        {entry.title && (
          preview ? (
            <Link to={`/entrada/${entry.id}`}>
              <h2 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100 leading-tight hover:underline">
                {entry.title}
              </h2>
            </Link>
          ) : (
            <h2 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {entry.title}
            </h2>
          )
        )}

        {/* Cuerpo del diario */}
        <div className="entry-content text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-serif">
          {entry.visibility === 'excerpt' && !isOwner ? (
            <div className="space-y-2">
              <p className="italic bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border-l-2 border-stone-300 dark:border-stone-700">
                "{entry.excerpt}"
              </p>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500">
                [Fragmento Público — El resto de la entrada es privada]
              </span>
            </div>
          ) : (
            <div
              className={preview ? 'line-clamp-6' : undefined}
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          )}
        </div>

        {/* Leer entrada completa (solo en modo preview) */}
        {preview && entry.visibility !== 'excerpt' && (
          <Link
            to={`/entrada/${entry.id}`}
            className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 font-medium transition-colors"
          >
            Continuar leyendo <ArrowRight size={12} />
          </Link>
        )}

        {/* Indicador de pregunta del día usada */}
        {entry.daily_prompt && isOwner && (
          <p className="text-[11px] text-stone-400 dark:text-stone-500 italic">
            Inspirado por: "{entry.daily_prompt}"
          </p>
        )}

        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

        {/* Acciones inferiores (Reacciones y Comentarios) */}
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/60 pt-3 mt-2">
          
          {/* Reacciones */}
          <div className="flex items-center flex-wrap gap-1.5">
            {REACTION_TYPES.map(({ type, emoji, label }) => {
              const count = getReactionCount(type)
              const active = hasUserReacted(type)
              return (
                <button
                  key={type}
                  onClick={() => handleReact(type)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition duration-200 ${
                    active
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-medium border border-stone-300 dark:border-stone-700'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-400 border border-transparent'
                  }`}
                  title={label}
                >
                  <span>{emoji}</span>
                  {count > 0 && <span className="text-[10px]">{count}</span>}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Comentarios Toggle */}
            {(entry.visibility !== 'private' || isOwner) && (
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800/40 transition duration-200 ${
                  showComments ? 'text-stone-800 dark:text-stone-100 font-medium' : 'text-stone-400'
                }`}
              >
                <MessageSquare size={14} />
                <span>{commentsList.length}</span>
              </button>
            )}

            {/* Eliminar entrada (Solo Dueño) */}
            {isOwner && (
              <button
                onClick={handleDeleteEntry}
                disabled={isDeleting}
                className="p-1 text-stone-400 hover:text-red-500 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800/40 transition duration-200"
                title="Eliminar entrada"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Sección de comentarios expandible */}
        {showComments && (entry.visibility !== 'private' || isOwner) && (
          <div className="border-t border-stone-100 dark:border-stone-800/50 pt-4 space-y-4">
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Comentarios
            </h3>

            {/* Lista de comentarios */}
            {commentsList.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No hay comentarios en esta entrada.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {commentsList.map(comment => {
                  const isCommentOwner = currentUser && comment.user_id === currentUser.id
                  const canDeleteComment = isCommentOwner || isOwner

                  return (
                    <div key={comment.id} className="text-xs bg-stone-50 dark:bg-stone-950 p-2.5 rounded-lg border border-stone-200/50 dark:border-stone-800/30 flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-stone-800 dark:text-stone-200">
                            {comment.user?.display_name || comment.user?.username}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            @{comment.user?.username}
                          </span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>

                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-stone-400 hover:text-red-500 p-0.5 rounded transition-colors"
                          title="Eliminar comentario"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Formulario para comentar */}
            {currentUser && (
              <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario respetuoso..."
                  className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-3 py-2 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-lg hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                  Enviar
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
