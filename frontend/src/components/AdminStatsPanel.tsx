// src/components/AdminStatsPanel.tsx
import { useEffect, useState } from 'react'
import axios from '../api/axios'

interface Stats {
    user_count: number
    job_count: number
    available_job_count: number
    last_updated: string
}

export default function AdminStatsPanel() {
    const [stats, setStats] = useState<Stats | null>(null)

    useEffect(() => {
        axios.get('/admin/stats')
            .then(res => {
                console.log('✅ Admin stats:', res.data)
                setStats(res.data)
            })
            .catch(err => {
                console.error('❌ Kunne ikke hente admin-statistikk', err)
            })
    }, [])

    if (!stats) return <p>Laster statistikk...</p>

    return (
        <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            marginTop: '2rem',
            fontFamily: 'sans-serif'
        }}>
            <h3>📊 Statistikk</h3>
            <p><strong>Brukere:</strong> {stats.user_count}</p>
            <p><strong>Søknader:</strong> {stats.job_count}</p>
            <p><strong>Ledige jobber:</strong> {stats.available_job_count}</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Sist oppdatert: {new Date(stats.last_updated).toLocaleString()}
            </p>
        </div>
    )
}
