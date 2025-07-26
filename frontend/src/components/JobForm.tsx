// src/components/JobForm.tsx
import { useState } from 'react'
import axios from '../api/axios'

export default function JobForm({ onAdd }: { onAdd: () => void }) {
    const [company, setCompany] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [status, setStatus] = useState('søkt')
    const [link, setLink] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await axios.post('/jobs', {
                company,
                job_title: jobTitle,
                status,
                link,
                notes
            })
            setCompany('')
            setJobTitle('')
            setStatus('søkt')
            setLink('')
            setNotes('')
            onAdd()
        } catch (err) {
            console.error('❌ Kunne ikke lagre jobben', err)
            alert('Noe gikk galt ved lagring av jobben')
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{
            marginTop: '2rem',
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            maxWidth: '500px'
        }}>
            <h3 style={{ marginBottom: '1rem' }}>📝 Legg til manuell søknad</h3>

            <div style={{ marginBottom: '1rem' }}>
                <label>Firma:</label><br />
                <input value={company} onChange={e => setCompany(e.target.value)} required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label>Stillingstittel:</label><br />
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label>Status:</label><br />
                <select value={status} onChange={e => setStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="søkt">Søkt</option>
                    <option value="intervju">Intervju</option>
                    <option value="avslått">Avslått</option>
                    <option value="tilbud">Tilbud</option>
                </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label>Lenke (valgfritt):</label><br />
                <input value={link} onChange={e => setLink(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label>Notater:</label><br />
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} />
            </div>

            <button type="submit" style={{
                padding: '0.6rem 1.2rem',
                background: '#5cb85c',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}>Lagre søknad</button>
        </form>
    )
}
