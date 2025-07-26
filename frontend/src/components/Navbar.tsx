// src/components/Navbar.tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from '../api/axios'

export default function Navbar() {
    const [email, setEmail] = useState<string>('')
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        axios.get('/me')
            .then(res => setEmail(res.data.email))
            .catch(() => setEmail(''))
    }, [])

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const linkStyle = (path: string) => ({
        padding: '0.5rem 1rem',
        textDecoration: 'none',
        color: location.pathname === path ? '#fff' : '#ddd',
        backgroundColor: location.pathname === path ? '#34495e' : 'transparent',
        borderRadius: '4px'
    })

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: '#2c3e50',
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>💼 Job Tracker</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/dashboard" style={linkStyle('/dashboard')}>🏠 Dashboard</Link>
                <Link to="/profile" style={linkStyle('/profile')}>👤 Min profil</Link>
                <Link to="/admin/applications" style={linkStyle('/admin/applications')}>📋 Søknader</Link>
                <button
                    onClick={logout}
                    style={{
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🔒 Logg ut
                </button>
            </div>
        </nav>
    )
}
