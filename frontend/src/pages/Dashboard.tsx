// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react'
import axios from '../api/axios'
import AvailableJobs from '../components/AvailableJobs'
import AvailableJobForm from '../components/AvailableJobForm'
import Navbar from '../components/Navbar'
import AdminStatsPanel from '../components/AdminStatsPanel'


interface Job {
    id: number
    company: string
    job_title: string
    status: string
    link?: string
    notes?: string
    created_at: string
}

export default function Dashboard() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [jobApplications, setJobApplications] = useState<Job[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(false)

    const fetchApplications = () => {
        axios
            .get('/jobs')
            .then((res) => setJobApplications(res.data))
            .catch((err) => console.error('Kunne ikke hente søknader', err))
    }

    useEffect(() => {
        axios
            .get('/me')
            .then((res) => setIsAdmin(res.data.is_admin))
            .catch(console.error)
    }, [])

    useEffect(() => {
        fetchApplications()
    }, [refreshTrigger])

    const logout = () => {
        localStorage.removeItem('token')
        window.location.href = '/'
    }

    const refresh = () => setRefreshTrigger((prev) => !prev)

    return (
        <>
            <Navbar />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: '2rem',
                    padding: '2rem',
                    fontFamily: 'sans-serif',
                    minHeight: '100vh',
                    backgroundColor: '#fefefe',
                }}
            >
                {/* VENSTRE side – Adminpanel */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: '1rem' }}>
                        {isAdmin ? 'Adminpanel' : 'Jobbpanel'}
                    </h2>

                    {isAdmin && (
                        <>
                            <AdminStatsPanel />
                            <AvailableJobForm onAdd={refresh} />
                        </>
                    )}

                    {!isAdmin && (
                        <>
                            <h3 style={{ marginTop: '3rem' }}>Dine søknader</h3>
                            <ul style={{ paddingLeft: 0 }}>
                                {jobApplications.map((job) => (
                                    <li key={job.id} style={{
                                        listStyle: 'none',
                                        marginBottom: '1rem',
                                        padding: '1rem',
                                        background: '#fff',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        <strong>{job.company}</strong> – {job.job_title}{' '}
                                        <span style={{
                                            backgroundColor:
                                                job.status === 'søkt' ? '#f0ad4e' :
                                                    job.status === 'intervju' ? '#5bc0de' :
                                                        job.status === 'tilbud' ? '#5cb85c' :
                                                            job.status === 'avslått' ? '#d9534f' : '#999',
                                            color: '#fff',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '4px',
                                            marginLeft: '1rem',
                                            fontSize: '0.9rem',
                                            textTransform: 'capitalize'
                                        }}>
                                            {job.status}
                                        </span><br />
                                        {job.link && (
                                            <a href={job.link} target="_blank" rel="noreferrer">Lenke</a>
                                        )}
                                        <p>{job.notes}</p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* HØYRE side – Ledige jobber */}
                <div style={{ flex: 1 }}>
                    <h3>Ledige jobber</h3>
                    <AvailableJobs
                        isAdmin={isAdmin}
                        onApplyOrDelete={refresh}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>
        </>
    )

}
