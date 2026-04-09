import React, { useState } from 'react';
import API from '../../api/axiosConfig';
import { X, UserPlus, Loader2 } from 'lucide-react';

const QuickCustomerModal = ({ isOpen, onClose, onCustomerCreated }) => {
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Calls the POST endpoint in CustomerController
            const res = await API.post('/api/customers', customerData);
            
            // Pass the new customer back to Bookings.jsx to auto-select them
            onCustomerCreated(res.data); 
            onClose();
            setCustomerData({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '' });
        } catch (err) {
            alert("Error: Could not create customer. Ensure the email is unique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', zIndex: 2000 
        }}>
            <div style={{ background: 'white', width: '400px', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h4 style={{ fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={20} /> Quick Add Customer
                    </h4>
                    <X size={20} onClick={onClose} style={{ cursor: 'pointer', color: '#64748b' }} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <input 
                            placeholder="First Name" required 
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            value={customerData.firstName}
                            onChange={e => setCustomerData({...customerData, firstName: e.target.value})}
                        />
                        <input 
                            placeholder="Last Name" required 
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            value={customerData.lastName}
                            onChange={e => setCustomerData({...customerData, lastName: e.target.value})}
                        />
                    </div>
                    <input 
                        type="email" placeholder="Email Address" required 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '15px' }}
                        value={customerData.email}
                        onChange={e => setCustomerData({...customerData, email: e.target.value})}
                    />
                    <input 
                        placeholder="Phone Number" 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '15px' }}
                        value={customerData.phoneNumber}
                        onChange={e => setCustomerData({...customerData, phoneNumber: e.target.value})}
                    />
                    <textarea 
                        placeholder="Physical Address" 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px', minHeight: '60px' }}
                        value={customerData.address}
                        onChange={e => setCustomerData({...customerData, address: e.target.value})}
                    />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ flex: 2, padding: '12px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickCustomerModal;