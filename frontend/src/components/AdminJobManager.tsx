import { useEffect, useState } from 'react'
import axios from '../api/axios'
import CreateAvailableJob from './CreateAvailableJob'

interface AvailableJob {
    id: number
    company: string
    title: string
    description?: string
    created_at: string
}

export default function AdminJobManager() {
    const [jobs, setJobs] = useState<AvailableJob[]>([])
    const [editing, setEditing] = useState<AvailableJob | null>(null)

    useEffect(() => {
        axios.get('/available-jobs').then(res => setJobs(res.data))
    }, [])

    const handleDelete = (id: number) => {
        if (confirm("Er du sikker på at du vil slette?")) {
            axios.delete(`/available-jobs/${id}`)
                .then(() => setJobs(prev => prev.filter(j => j.id !== id)))
                .catch(err => console.error(err))
        }
    }

    const handleSave = () => {
        if (!editing) return
        axios.put(`/available-jobs/${editing.id}`, editing)
            .then(() => {
                setEditing(null)
                return axios.get('/available-jobs')
            })
            .then(res => setJobs(res.data))
    }

    return (
        <div>
            <h2>Admin Jobbkontrollpanel</h2>

            <CreateAvailableJob onCreate={() => axios.get('/available-jobs').then(res => setJobs(res.data))} />

            {jobs.map(job => (
                <div key={job.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
                    {editing?.id === job.id ? (
                        <>
                            <input value={editing.company} onChange={e => setEditing({ ...editing, company: e.target.value })} />
                            <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                            <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                            <button onClick={handleSave}>Lagre</button>
                            <button onClick={() => setEditing(null)}>Avbryt</button>
                        </>
                    ) : (
                        <>
                            <strong>{job.company}</strong> – {job.title}<br />
                            <p>{job.description}</p>
                            <button onClick={() => setEditing(job)}>Rediger</button>
                            <button onClick={() => handleDelete(job.id)}>Slett</button>
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}
