// src/components/AvailableJobs.tsx
import { useEffect, useState } from 'react'
import axios from '../api/axios'

interface AvailableJob {
    id: number
    company: string
    title: string
    description?: string
    created_at: string
}

interface JobApplication {
    id: number
    company: string
    job_title: string
    status: string
    created_at: string
}

export default function AvailableJobs({
    isAdmin,
    onApplyOrDelete,
    refreshTrigger,
}: {
    isAdmin: boolean
    onApplyOrDelete: () => void
    refreshTrigger: boolean
}) {
    const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([])
    const [userApplications, setUserApplications] = useState<JobApplication[]>([])

    const fetchAll = async () => {
        try {
            const [availableRes, appliedRes] = await Promise.all([
                axios.get('/available-jobs'),
                axios.get('/jobs'),
            ])
            setAvailableJobs(availableRes.data)
            setUserApplications(appliedRes.data)
        } catch (err) {
            console.error('Feil ved henting av jobber', err)
        }
    }

    useEffect(() => {
        fetchAll()
    }, [refreshTrigger])

    const handleApply = async (job: AvailableJob) => {
        try {
            await axios.post(`/apply/${job.id}`)
            onApplyOrDelete()
        } catch (err) {
            console.error('Søknad feilet', err)
        }
    }

    const handleDelete = async (jobId: number) => {
        if (confirm('Er du sikker på at du vil slette denne jobben?')) {
            try {
                await axios.delete(`/available-jobs/${jobId}`)
                onApplyOrDelete()
            } catch (err) {
                console.error('Feil ved sletting', err)
            }
        }
    }

    const handleEdit = (job: AvailableJob) => {
        const newTitle = prompt('Ny tittel:', job.title)
        const newDescription = prompt('Ny beskrivelse:', job.description)
        if (newTitle !== null && newDescription !== null) {
            axios
                .put(`/available-jobs/${job.id}`, {
                    title: newTitle,
                    description: newDescription,
                })
                .then(() => onApplyOrDelete())
        }
    }

    const appliedTitles = new Set(
        userApplications.map((app) => app.job_title.toLowerCase())
    )
    const visibleJobs = availableJobs.filter((job) =>
        isAdmin ? true : !appliedTitles.has(job.title.toLowerCase())
    )

    return (
        <div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                {visibleJobs.map((job) => (
                    <div key={job.id} style={{
                        border: '3px solid #ccc',
                        padding: '1rem',
                        borderRadius: '8px',
                        width: '400px',
                        background: '#fff',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            {/* 🖼️ Logo + Firmanavn med link */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                {job.logo_url && (
                                    <img src={job.logo_url} alt="logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                                )}
                                {job.company_link ? (
                                    <a href={job.company_link} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', fontSize: '1rem', textDecoration: 'none', color: '#0275d8' }}>
                                        {job.company}
                                    </a>
                                ) : (
                                    <h4 style={{ margin: 0 }}>{job.company}</h4>
                                )}
                            </div>

                            {/* 📝 Tittel og beskrivelse */}
                            <strong>{job.title}</strong>
                            <p style={{ fontSize: '1rem', color: '#444' }}>{job.description}</p>
                        </div>

                        {/* 🔘 Knapper */}
                        <div style={{ marginTop: '1rem' }}>
                            {isAdmin ? (
                                <>
                                    <button
                                        onClick={() => handleEdit(job)}
                                        style={{
                                            padding: '0.3rem 0.6rem',
                                            marginRight: '0.5rem',
                                            backgroundColor: '#0275d8',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✏️ Rediger
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        style={{
                                            padding: '0.3rem 0.6rem',
                                            backgroundColor: '#d9534f',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️ Slett
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleApply(job)}
                                    style={{
                                        padding: '0.5rem',
                                        width: '100%',
                                        backgroundColor: '#5cb85c',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Søk på stillingen
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {visibleJobs.length === 0 && (
                    <p style={{ fontStyle: 'italic', marginTop: '1rem' }}>Ingen tilgjengelige jobber</p>
                )}
            </div>
        </div>
    )

}
