import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import axios from '../api/axios'

export default function LoginPage() {
    const handleLogin = async (credentialResponse: any) => {
        try {
            const id_token = credentialResponse.credential
            const res = await axios.post('/login', { id_token })
            localStorage.setItem('token', res.data.access_token)
            window.location.href = '/dashboard'
        } catch (err) {
            alert('Login feilet')
            console.error(err)
        }
    }

    return (
        <GoogleOAuthProvider clientId="37887835668-vg17g6d8u4g3o1i45jhdbpmpare25v1e.apps.googleusercontent.com">
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'lightblue',
                fontFamily: 'sans-serif',
                padding: '1rem',
                border:'t'
            }}>
                <div style={{
                    background: '#fff',
                    padding: '3rem 2.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
                    border: '3px solid #333', 
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '500px'
                }}>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>💼 Job Tracker</h1>
                    <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>
                        Logg inn med Google for å komme i gang
                    </p>

                    <GoogleLogin
                        onSuccess={handleLogin}
                        onError={() => alert('Feil ved login')}
                        size="large"
                        theme="outline"
                        width="100%"
                    />

                    {/* Footer */}
                    <p style={{
                        marginTop: '2rem',
                        fontSize: '0.85rem',
                        color: '#999'
                    }}>
                        Made with <span style={{ color: 'red' }}>♥</span> by Sushant
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    )
}
