// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import JobApplicationsAdmin from './pages/JobApplicationsAdmin'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/applications" element={<JobApplicationsAdmin />} />
            </Routes>
        </Router>
    )
}

export default App
