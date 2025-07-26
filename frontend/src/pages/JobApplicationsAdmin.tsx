// src/pages/JobApplicationsAdmin.tsx
import { useEffect, useState } from 'react'
import axios from '../api/axios'
import Navbar from '../components/Navbar'

interface JobApplication {
  id: number
  company: string
  job_title: string
  status: string
  user_email: string
}

export default function JobApplicationsAdmin() {
  const [applications, setApplications] = useState<JobApplication[]>([])

  useEffect(() => {
    axios.get('/admin/applications')
      .then(res => setApplications(res.data))
      .catch(err => console.error('Kunne ikke hente søknader', err))
  }, [])

    const handleStatusChange = (id: number, newStatus: string) => {
        setApplications(applications.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ))
    }


    const handleSave = (id: number, status: string) => {
        axios.put(`/jobs/${id}`, { status })  // 👈 riktig payload
            .then(() => alert('✅ Status oppdatert'))
            .catch(() => alert('❌ Kunne ikke oppdatere status'))
    }


  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>📋 Admin – Søknader</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {applications.map(app => (
            <div key={app.id} style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <p><strong>{app.user_email}</strong> søkte på <strong>{app.job_title}</strong> hos <strong>{app.company}</strong></p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label>Status:</label>
                <select
                  value={app.status}
                  onChange={e => handleStatusChange(app.id, e.target.value)}
                >
                  <option value="søkt">Søkt</option>
                  <option value="intervju">Intervju</option>
                  <option value="tilbud">Tilbud</option>
                  <option value="avslått">Avslått</option>
                </select>
                      <button
                          onClick={() => handleSave(app.id, applications.find(a => a.id === app.id)?.status || 'søkt')}
                          style={{
                              padding: '0.3rem 0.8rem',
                              background: '#0275d8',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                          }}
                      >
                          Lagre
                      </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
