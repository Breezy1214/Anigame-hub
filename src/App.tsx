import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'

function HomePage() {
  return (
    <main className="auth-page">
      <h1>AniGame Hub</h1>
      <p>Track your anime and video games in one place.</p>
      <Link to="/register">Create an account</Link>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
