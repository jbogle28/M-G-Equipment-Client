import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, CheckCircle, Loader2, Lock } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI States
    const [step, setStep] = useState(1); // 1: Email, 2: New Password, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // STEP 1: Verify if email exists 
    const handleVerifyEmail = (e) => {
        e.preventDefault();
        if (!email) return setError("Please enter your email.");
        setStep(2);
        setError('');
    };

    // STEP 2: Final Submission
    const handleFinalReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Client-side validation
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await API.put('/api/auth/reset-password', { 
                email, 
                newPassword 
            });
            setStep(3);
        } catch (err) {
            if (err.response && err.response.data) {
                // Shows response from backend
                setError(err.response.data);
                // If user doesn't exist, go back to step 1
                if (err.status === 400) setStep(1);
            } else {
                setError("Server connection failed. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                
                {/* STEP 1: EMAIL ENTRY */}
                {step === 1 && (
                    <>
                        <div className="auth-header">
                            <ShieldCheck size={48} color="#2563eb" style={{ marginBottom: '10px' }} />
                            <h1>FIND ACCOUNT</h1>
                            <p>Enter your email to reset your password</p>
                        </div>

                        {error && <div className="error-banner">{error}</div>}

                        <form onSubmit={handleVerifyEmail}>
                            <div className="form-group">
                                <label>Staff Email</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        placeholder="staff@mg.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary">
                                Next
                            </button>
                        </form>
                    </>
                )}

                {/* STEP 2: PASSWORD ENTRY */}
                {step === 2 && (
                    <>
                        <div className="auth-header">
                            <Lock size={48} color="#2563eb" style={{ marginBottom: '10px' }} />
                            <h1>NEW PASSWORD</h1>
                            <p>Resetting password for: <strong>{email}</strong></p>
                        </div>

                        {error && <div className="error-banner">{error}</div>}

                        <form onSubmit={handleFinalReset}>
                            <div className="form-group">
                                <label>New Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
                            </button>
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={() => setStep(1)} 
                                style={{ marginTop: '10px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            >
                                Use different email
                            </button>
                        </form>
                    </>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle size={60} color="#10b981" style={{ marginBottom: '15px' }} />
                        <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Password Updated</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                            Your password has been changed successfully. You can now log in with your new credentials.
                        </p>
                        <Link to="/" className="btn-primary" style={{ display: 'block', marginTop: '25px', textDecoration: 'none' }}>
                            Back to Login
                        </Link>
                    </div>
                )}

                {step !== 3 && (
                    <div className="auth-footer" style={{ justifyContent: 'center' }}>
                        <Link to="/" className="auth-link">Return to Login</Link>
                    </div>
                )}
            </div>

            <style>{`
                .error-banner {
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    text-align: center;
                    background-color: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
