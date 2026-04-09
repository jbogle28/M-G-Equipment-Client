import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import API from '../api/axiosConfig'; 
import { Lock, Mail, Loader2, HardHat } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate(); 

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await API.post('/api/auth/login', credentials);
            const userData = typeof response.data === 'string' 
                ? { token: response.data } 
                : response.data;

            localStorage.setItem('user', JSON.stringify(userData));

            navigate('/dashboard'); 
        } catch (err) {
            console.error("Login attempt failed:", err);
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (err.code === "ERR_NETWORK") {
                setError('Could not connect to server. Is the backend running?');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <HardHat size={40} color="#2563eb" style={{marginBottom: '10px'}}/>
                    <h1>M&G INDUSTRIAL</h1>
                    <p>Staff Login</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textAlign: 'center',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input 
                                name="email" 
                                type="email" 
                                placeholder="staff@mg.com" 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input 
                                name="password" 
                                type="password" 
                                placeholder="••••••••" 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Authenticate"}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/register" className="auth-link">Create Account</Link>
                    <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;