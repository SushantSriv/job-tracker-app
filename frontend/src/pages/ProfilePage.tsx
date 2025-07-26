// src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react'
import axios from '../api/axios'
import Navbar from '../components/Navbar'

interface User {
    email: string
    google_id: string
    is_admin: boolean
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        axios.get('/me')
            .then(res => setUser(res.data))
            .catch(err => console.error('Kunne ikke hente brukerdata', err))
    }, [])

    if (!user) {
        return (
            <>
                <Navbar />
                <div style={{ padding: '2rem' }}>Laster brukerdata...</div>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div style={{
                padding: '2rem',
                fontFamily: 'sans-serif',
                background: '#f5f7fa',
                minHeight: '100vh'
            }}>
                <h2>👤 Profil</h2>
                <div style={{
                    background: '#fff',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    maxWidth: '500px'
                }}>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Google ID:</strong> {user.google_id}</p>
                    <p><strong>Rolle:</strong> {user.is_admin ? 'Admin' : 'Bruker'}</p>
                </div>
            </div>
        </>
    )
}
