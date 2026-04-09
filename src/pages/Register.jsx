import React, { useState } from 'react';
import API from '../api/axiosConfig'; 
import { User, Mail, Lock, HardHat, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {

    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'STAFF' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' }); 
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: '' }); 

        try {
            await API.post('/api/auth/register', formData);
            setStatus({ type: 'success', msg: 'Account Created Successfully! Redirecting...' });
            
            setTimeout(() => navigate('/'), 2000); 
        } catch (err) {
            setStatus({ 
                type: 'error', 
                msg: err.response?.data?.message || "Registration failed. Please check your credentials." 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <HardHat size={40} color="#2563eb" style={{marginBottom: '10px'}}/>
                    <h1>JOIN M&G STAFF</h1>
                    <p>Create your industrial account</p>
                </div>

                {/* Status Message Display */}
                {status.msg && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textAlign: 'center',
                        backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: status.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group">
                            <label>First Name</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input name="firstName" type="text" placeholder="John" onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input name="lastName" type="text" placeholder="Doe" onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Work Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input name="email" type="email" placeholder="staff@mg.com" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Set Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer" style={{justifyContent: 'center'}}>
                    <Link to="/" className="auth-link">
                       <ArrowLeft size={14} style={{marginRight: '5px'}}/> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
