import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { Plus, Search, Loader2, Edit2, Trash2, X, CheckCircle, AlertCircle, User, Mail, Phone, MapPin } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', address: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/customers');
            setCustomers(res.data);
        } catch (err) {
            showToast("Error fetching customers", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const handleDelete = async (customer) => {
        if (window.confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) {
            try {
                await API.delete(`/api/customers/${customer.id}`);
                showToast("Customer removed successfully");
                fetchCustomers();
            } catch (err) {
                showToast("Cannot delete customer with active booking history", "error");
            }
        }
    };

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({ ...customer });
        } else {
            setEditingCustomer(null);
            setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await API.post('/api/customers', { ...formData, id: editingCustomer.id });
                showToast("Customer profile updated");
            } else {
                await API.post('/api/customers', formData);
                showToast("New customer registered");
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (err) {
            showToast("Check email uniqueness or data format", "error");
        }
    };

    const filteredCustomers = customers.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            {/* TOAST NOTIFICATION */}
            {toast.show && (
                <div style={toastStyles(toast.type)}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontWeight: '700' }}>{toast.message}</span>
                </div>
            )}

            <header style={headerStyles}>
                <div>
                    <h2 style={{ fontWeight: '900', color: '#1e293b' }}>CUSTOMER DIRECTORY</h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Manage client profiles and contact information</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={searchIconStyles} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            style={searchInputStyles}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => openModal()}>
                        <Plus size={20} /> Add Customer
                    </button>
                </div>
            </header>

            {loading ? (
                <div style={loaderContainerStyles}><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <table className="mg-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email Address</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id}>
                                <td style={{ fontWeight: '700', color: '#1e293b' }}>{customer.firstName} {customer.lastName}</td>
                                <td style={{ color: '#2563eb' }}>{customer.email}</td>
                                <td>{customer.phoneNumber || 'N/A'}</td>
                                <td style={{ fontSize: '13px', color: '#64748b' }}>{customer.address || 'No address provided'}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button onClick={() => openModal(customer)} style={actionBtnStyles('#2563eb')}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(customer)} style={actionBtnStyles('#ef4444')}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* SLIDE-OUT MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" style={overlayStyles} onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" style={modalContentStyles} onClick={e => e.stopPropagation()}>
                        <div style={modalHeaderStyles}>
                            <h3 style={{ fontWeight: '800' }}>{editingCustomer ? 'Edit Profile' : 'Register Customer'}</h3>
                            <X onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <FormField label="First Name" icon={<User size={16}/>} value={formData.firstName} 
                                    onChange={v => setFormData({...formData, firstName: v})} required />
                                <FormField label="Last Name" value={formData.lastName} 
                                    onChange={v => setFormData({...formData, lastName: v})} required />
                            </div>

                            <FormField label="Email Address" icon={<Mail size={16}/>} type="email" value={formData.email} 
                                onChange={v => setFormData({...formData, email: v})} required />
                            
                            <FormField label="Phone Number" icon={<Phone size={16}/>} value={formData.phoneNumber} 
                                onChange={v => setFormData({...formData, phoneNumber: v})} />

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyles}>Residential Address</label>
                                <div style={inputWrapperStyles}>
                                    <MapPin size={16} style={inputIconStyles} />
                                    <textarea 
                                        style={{ ...inputStyles, paddingLeft: '35px', height: '80px', resize: 'none' }}
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                                {editingCustomer ? 'Update Customer' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const FormField = ({ label, value, onChange, type = "text", required = false, icon }) => (
    <div style={{ marginBottom: '20px', flex: 1 }}>
        <label style={labelStyles}>{label} {required && '*'}</label>
        <div style={inputWrapperStyles}>
            {icon && <span style={inputIconStyles}>{icon}</span>}
            <input 
                type={type} required={required} 
                style={{ ...inputStyles, paddingLeft: icon ? '35px' : '12px' }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

// --- STYLES ---
const headerStyles = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const searchInputStyles = { padding: '8px 12px 8px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', width: '250px' };
const searchIconStyles = { position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' };
const loaderContainerStyles = { display: 'flex', justifyContent: 'center', padding: '100px' };
const actionBtnStyles = (color) => ({ color, background: 'none', border: 'none', marginLeft: '12px', cursor: 'pointer' });
const overlayStyles = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 };
const modalContentStyles = { width: '450px', background: 'white', height: '100%', padding: '40px', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', overflowY: 'auto' };
const modalHeaderStyles = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const labelStyles = { display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#475569' };
const inputWrapperStyles = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIconStyles = { position: 'absolute', left: '12px', color: '#94a3b8' };
const inputStyles = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const toastStyles = (type) => ({
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
    color: 'white', padding: '16px 24px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease-out'
});

export default Customers;