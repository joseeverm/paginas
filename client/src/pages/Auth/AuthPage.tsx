import { Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { loginUser, registerUser } from '../../api/auth'
import { useTheme } from '../../store/useTheme'
import Logo from '../../components/Logo'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      let result
      if (mode === 'login') {
        result = await loginUser(email, password)
      } else {
        result = await registerUser(username, email, password)
      }
      login(result.user, result.token)
      navigate('/home')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4 transition-colors duration-300">

      {/* Toggle tema */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
        aria-label="Cambiar tema"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <Logo size={52} showText={false} />
          <div className="text-center">
            <h1 className="text-3xl font-serif text-stone-800 dark:text-stone-100 tracking-tight">Páginas</h1>
            <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">Tu diario, tu voz</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 mb-8">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'text-stone-800 dark:text-stone-100 border-b-2 border-stone-800 dark:border-stone-100'
                : 'text-stone-400 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-400'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'text-stone-800 dark:text-stone-100 border-b-2 border-stone-800 dark:border-stone-100'
                : 'text-stone-400 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-400'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Nombre de usuario</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ej: jose_escribe"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 text-sm placeholder:text-stone-300 dark:placeholder:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-700 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 text-sm placeholder:text-stone-300 dark:placeholder:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-700 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 text-sm placeholder:text-stone-300 dark:placeholder:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-700 transition"
            />
          </div>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium rounded-xl hover:bg-stone-700 dark:hover:bg-stone-200 disabled:opacity-50 transition mt-2"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 dark:text-stone-600 mt-8">
          Escribe libremente. Sin ruido.
        </p>
      </div>
    </div>
  )
}