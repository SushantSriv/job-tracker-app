// src/components/AvailableJobForm.tsx
import { useState } from 'react'
import axios from '../api/axios'

export default function AvailableJobForm({ onAdd }: { onAdd: () => void }) {
    const [company, setCompany] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [companyLink, setCompanyLink] = useState('')
    const [logoUrl, setLogoUrl] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await axios.post('/available-jobs', {
                company,
                title,
                description,
                company_link: companyLink,
                logo_url: logoUrl
            })
            setCompany('')
            setTitle('')
            setDescription('')
            setCompanyLink('')
            setLogoUrl('')
            onAdd()
        } catch (err) {
            console.error('❌ Kunne ikke opprette tilgjengelig jobb', err)
            alert('Noe gikk galt ved oppretting av tilgjengelig jobb')
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
        }}>
            <h3>➕ Legg til ny tilgjengelig jobb (Admin)</h3>

            <div>
                <label>Firma:</label><br />
                <input value={company} onChange={e => setCompany(e.target.value)} required />
            </div>

            <div>
                <label>Stillingstittel:</label><br />
                <input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div>
                <label>Beskrivelse:</label><br />
                <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div>
                <label>Firmanettsted (URL):</label><br />
                <input value={companyLink} onChange={e => setCompanyLink(e.target.value)} />
            </div>

            <div>
                <label>Logo (bilde-URL):</label><br />
                <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
            </div>

            <button type="submit" style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#0275d8',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}>
                Lagre jobb
            </button>
        </form>
    )
}
