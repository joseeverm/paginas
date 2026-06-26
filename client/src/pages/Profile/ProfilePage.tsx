import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { getProfile, updateProfile, toggleFollow } from '../../api/profile'
import EntryCard from '../../components/EntryCard'
import { LogOut, Edit2, Users, Heart, ExternalLink, Check, X, Camera } from 'lucide-react'
import type { Entry } from '../../types'

export default function ProfilePage() {
  const { user: currentUser, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [profileUser, setProfileUser] = useState<any>(null)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edición de perfil
  const [isEditing, setIsEditing] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [editInstagram, setEditInstagram] = useState('')
  const [editTwitter, setEditTwitter] = useState('')
  const [editLinkedin, setEditLinkedin] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Donación
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [donationAmount, setDonationAmount] = useState('10000') // default 10k cop
  const [donationMessage, setDonationMessage] = useState('')
  const [donatedSuccessfully, setDonatedSuccessfully] = useState(false)

  const usernameParam = searchParams.get('u')
  const isOwnProfile = !usernameParam || (currentUser && usernameParam === currentUser.username)

  async function loadProfile() {
    setError('')
    try {
      const usernameToFetch = usernameParam || currentUser?.username
      if (!usernameToFetch) {
        setLoading(false)
        return
      }

      const res = await getProfile(usernameToFetch)
      setProfileUser(res.user)
      setFollowersCount(res.followersCount)
      setFollowingCount(res.followingCount)
      setIsFollowing(res.isFollowing)
      setEntries(res.entries)

      // Cargar campos de edición
      setEditDisplayName(res.user.display_name || '')
      setEditBio(res.user.bio || '')
      setEditAvatarUrl(res.user.avatar_url || '')
      const social = res.user.social_links as any || {}
      setEditInstagram(social.instagram || '')
      setEditTwitter(social.twitter || '')
      setEditLinkedin(social.linkedin || '')
    } catch (err: any) {
      setError(err.message || 'Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [usernameParam, currentUser])

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  // Seguir / Dejar de seguir
  async function handleFollowToggle() {
    if (!profileUser || !currentUser) return
    try {
      const res = await toggleFollow(profileUser.id)
      setIsFollowing(res.following)
      setFollowersCount(prev => res.following ? prev + 1 : prev - 1)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar seguimiento')
    }
  }

  // Guardar perfil
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setError('')
    try {
      const updated = await updateProfile({
        display_name: editDisplayName.trim() || undefined,
        bio: editBio.trim() || undefined,
        avatar_url: editAvatarUrl.trim() || undefined,
        social_links: {
          instagram: editInstagram.trim(),
          twitter: editTwitter.trim(),
          linkedin: editLinkedin.trim()
        }
      })
      
      setProfileUser(updated)
      updateUser(updated) // Actualizar globalmente en contexto
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditAvatarUrl(reader.result as string)
      setAvatarUploading(false)
    }
    reader.onerror = () => setAvatarUploading(false)
    reader.readAsDataURL(file)
  }

  // Enviar donación simulada
  function handleDonateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDonatedSuccessfully(true)
    setTimeout(() => {
      setShowDonateModal(false)
      setDonatedSuccessfully(false)
      setDonationMessage('')
    }, 3000)
  }

  if (loading) {
    return <div className="text-center py-10 text-stone-400 dark:text-stone-500 text-sm">Cargando perfil...</div>
  }

  if (!profileUser) {
    return (
      <div className="text-center py-10 text-stone-400 dark:text-stone-500 text-sm">
        Usuario no encontrado.
      </div>
    )
  }

  const socialLinks = profileUser.social_links as any || {}

  return (
    <div className="space-y-6">
      {/* Header Perfil */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          
          {/* Info Básica */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {profileUser.avatar_url ? (
              <img
                src={profileUser.avatar_url}
                alt={profileUser.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-stone-200 dark:border-stone-800"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-700">
                <Users size={36} />
              </div>
            )}
            
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                {profileUser.display_name || profileUser.username}
              </h1>
              <p className="text-xs text-stone-400 dark:text-stone-500">@{profileUser.username}</p>
              
              {/* Contadores seguidores */}
              <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-2 justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <strong className="text-stone-700 dark:text-stone-300">{followersCount}</strong> seguidores
                </span>
                <span className="flex items-center gap-1">
                  <strong className="text-stone-700 dark:text-stone-300">{followingCount}</strong> seguidos
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                >
                  <Edit2 size={12} /> Editar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                  title="Cerrar Sesión"
                >
                  <LogOut size={12} /> Salir
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-1.5 text-xs font-medium rounded-xl transition ${
                    isFollowing
                      ? 'border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      : 'bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-200'
                  }`}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-xl hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition"
                  title="Apoyar escritura"
                >
                  <Heart size={12} fill="currentColor" /> Apoyar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profileUser.bio ? (
          <p className="text-sm font-serif text-stone-600 dark:text-stone-300 leading-relaxed text-center sm:text-left bg-stone-50/50 dark:bg-stone-950/30 p-3.5 rounded-xl border border-stone-100 dark:border-stone-850">
            {profileUser.bio}
          </p>
        ) : (
          isOwnProfile && (
            <p className="text-xs text-stone-400 dark:text-stone-500 italic text-center sm:text-left">
              Aún no has escrito una biografía. Presiona "Editar" para presentarte ante la comunidad.
            </p>
          )
        )}

        {/* Enlaces Sociales */}
        {(socialLinks.instagram || socialLinks.twitter || socialLinks.linkedin) && (
          <div className="flex flex-wrap gap-3 items-center pt-2 justify-center sm:justify-start">
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">Enlaces:</span>
            {socialLinks.instagram && (
              <a
                href={`https://instagram.com/${socialLinks.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              >
                <ExternalLink size={12} /> Instagram
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={`https://twitter.com/${socialLinks.twitter}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              >
                <ExternalLink size={12} /> Twitter
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              >
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Listado de Publicaciones */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          {isOwnProfile ? 'Tus entradas publicadas y privadas' : 'Entradas públicas de este autor'}
        </h2>

        {entries.length === 0 ? (
          <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center bg-white/40 dark:bg-stone-900/10">
            <p className="text-xs text-stone-400 dark:text-stone-500 italic">No hay entradas disponibles en este perfil.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {entries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onUpdate={loadProfile}
                preview
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar Perfil */}
      {isEditing && (
        <div className="fixed inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Editar tu perfil</h3>
              <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Nombre a mostrar</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={e => setEditDisplayName(e.target.value)}
                    placeholder="ej: José Escritor"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Foto de perfil</label>
                  <div className="flex items-center gap-4">
                    {/* Preview circular */}
                    <div className="relative shrink-0">
                      {editAvatarUrl ? (
                        <img
                          src={editAvatarUrl}
                          alt="preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 dark:border-stone-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-600">
                          <Users size={28} />
                        </div>
                      )}
                      {/* Botón cámara encima */}
                      <label className="absolute inset-0 rounded-full flex items-center justify-center bg-stone-900/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={16} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={avatarUploading}
                          onChange={handleAvatarFileChange}
                        />
                      </label>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="flex items-center gap-2 px-3 py-2 border border-stone-200 dark:border-stone-800 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                        <Camera size={13} className="text-stone-400" />
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          {avatarUploading ? 'Cargando...' : 'Elegir imagen'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={avatarUploading}
                          onChange={handleAvatarFileChange}
                        />
                      </label>
                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl('')}
                          className="text-[10px] text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Biografía</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Cuéntale a la comunidad quién eres y qué te inspira a escribir..."
                    rows={4}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none resize-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition"
                  />
                </div>
                
                <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-3">
                  <span className="block text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Enlaces sociales</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-stone-400 mb-1">Usuario de Instagram</label>
                      <input
                        type="text"
                        value={editInstagram}
                        onChange={e => setEditInstagram(e.target.value)}
                        placeholder="jose_escribe"
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-400 mb-1">Usuario de Twitter / X</label>
                      <input
                        type="text"
                        value={editTwitter}
                        onChange={e => setEditTwitter(e.target.value)}
                        placeholder="jose_escribe"
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1">LinkedIn ID</label>
                    <input
                      type="text"
                      value={editLinkedin}
                      onChange={e => setEditLinkedin(e.target.value)}
                      placeholder="jose-escribano-1234"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-stone-50 dark:bg-stone-900/60 p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-medium rounded-lg hover:bg-stone-700 dark:hover:bg-stone-200"
                >
                  {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Donación */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-1">
                <Heart size={14} className="text-rose-500" fill="currentColor" /> Apoyar a @{profileUser.username}
              </h3>
              <button onClick={() => setShowDonateModal(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                <X size={16} />
              </button>
            </div>
            
            {donatedSuccessfully ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="text-sm font-medium text-stone-800 dark:text-stone-100">¡Donación simulada con éxito!</h4>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Gracias por valorar el trabajo de los escritores independientes. Tu apoyo mantiene viva la literatura.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDonateSubmit}>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    Páginas no cobra comisiones excesivas. El total recaudado va directamente al autor de este diario para apoyar su proceso creativo.
                  </p>
                  
                  <div>
                    <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Monto de la contribución</label>
                    <select
                      value={donationAmount}
                      onChange={e => setDonationAmount(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs py-2 px-3 rounded-lg focus:outline-none"
                    >
                      <option value="10000">$10.000 COP (Un café)</option>
                      <option value="20000">$20.000 COP (Un libro de bolsillo)</option>
                      <option value="50000">$50.000 COP (Una buena lectura)</option>
                      <option value="100000">$100.000 COP (Mecenas de la palabra)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Mensaje opcional para el autor</label>
                    <textarea
                      value={donationMessage}
                      onChange={e => setDonationMessage(e.target.value)}
                      placeholder="Me encantó tu relato sobre..."
                      rows={3}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs rounded-lg focus:outline-none resize-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition"
                    />
                  </div>
                </div>
                
                <div className="bg-stone-50 dark:bg-stone-900/60 p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDonateModal(false)}
                    className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-500 transition-colors flex items-center gap-1"
                  >
                    Contribuir
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
