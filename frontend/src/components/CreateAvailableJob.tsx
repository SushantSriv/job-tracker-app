import { useState } from 'react'
import axios from '../api/axios'

export default function CreateAvailableJob({ onCreate }: { onCreate: () => void }) {
    const [company, setCompany] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        axios.post('/available-jobs', {
            company,
            title,
            description
        })
            .then(() => {
                setCompany('')
                setTitle('')
                setDescription('')
                onCreate() // Refresh available jobs list
            })
            .catch(() => alert('Feil ved lagring'))
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <h3>➕ Opprett ny tilgjengelig jobb</h3>
            <input
                type="text"
                placeholder="Firma"
                value={company}
                onChange={e => setCompany(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Stillingstittel"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Beskrivelse (valgfritt)"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <button type="submit">Lagre</button>
        </form>
    )
}
