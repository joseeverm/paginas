import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/Auth/AuthPage'
import HomePage from './pages/Home/HomePage'
import ExplorePage from './pages/Explore/ExplorePage'
import WritePage from './pages/Write/WritePage'
import JournalsPage from './pages/Journals/JournalsPage'
import ProfilePage from './pages/Profile/ProfilePage'
import EntryPage from './pages/Entry/EntryPage'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/explorar" element={<ExplorePage />} />
            <Route path="/escribir" element={<WritePage />} />
            <Route path="/diarios" element={<JournalsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/entrada/:id" element={<EntryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
