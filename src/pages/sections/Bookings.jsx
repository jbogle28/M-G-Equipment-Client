import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import QuickCustomerModal from '../components/QuickCustomerModal'; 
import BookingDetails from '../components/BookingDetails';
import { 
    Plus, Search, Loader2, X, CheckCircle, AlertCircle, UserPlus, Lock, User, Calendar, Package 
} from 'lucide-react';

const Bookings = ({ initialOpen = false }) => {
    const [bookings, setBookings] = useState([]);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCustomerPopupOpen, setIsCustomerPopupOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmCloseId, setConfirmCloseId] = useState(null); 
    const [selectedBooking, setSelectedBooking] = useState(null); 

    const todayStr = new Date().toISOString().split('T')[0];

    // Styles Object for the Modal
    const modalStyles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            padding: '20px'
        },
        container: {
            width: '100%', maxWidth: '600px', background: 'white', borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'slideUp 0.3s ease-out'
        },
        header: {
            padding: '24px 32px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fafafa'
        },
        sectionTitle: {
            fontSize: '12px', fontWeight: '800', color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '8px'
        },
        assetGrid: {
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            maxHeight: '240px', overflowY: 'auto', padding: '4px'
        },
        assetCard: (isSelected) => ({
            padding: '12px', borderRadius: '12px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            background: isSelected ? '#eff6ff' : 'white', cursor: 'pointer',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '10px'
        }),
        footer: {
            padding: '24px 32px', borderTop: '1px solid #f1f5f9', background: '#fafafa',
            display: 'flex', gap: '12px'
        }
    };

    useEffect(() => {
        if (initialOpen) {
            setIsModalOpen(true);
        }
    }, [initialOpen]);

    const [formData, setFormData] = useState({
        customerId: '',
        selectedAssetIds: [],
        returnDate: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingRes, assetRes, customerRes] = await Promise.all([
                API.get('/api/bookings'),
                API.get('/api/assets'),
                API.get('/api/customers') 
            ]);
            setBookings(bookingRes.data);
            setAvailableAssets(assetRes.data.filter(a => a.status === 'AVAILABLE'));
            setCustomers(customerRes.data);
        } catch (err) {
            showToast("Error loading booking data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCustomerCreated = (newCustomer) => {
        setCustomers(prev => [...prev, newCustomer]);
        setFormData(prev => ({ ...prev, customerId: newCustomer.id.toString() }));
        showToast(`Customer ${newCustomer.firstName} added and selected!`);
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        const selectedDate = new Date(formData.returnDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showToast("The return date must be today or in the future.", "error");
            return;
        }

        const payload = {
            customer: { id: parseInt(formData.customerId) },
            creator: { id: 1 }, 
            returnDate: selectedDate.toISOString(),
            assetList: formData.selectedAssetIds.map(id => ({ assetId: id })),
            dayCount: 0,
            late: false,
            status: 'ONGOING'
        };

        try {
            await API.post('/api/bookings', payload);
            showToast("Booking created successfully!");
            closeModal();
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.error || "Booking failed", "error");
        }
    };

    const handleCloseBooking = async (id) => {
        try {
            await API.put(`/api/bookings/${id}/close`);
            showToast("Booking closed and assets released.");
            setConfirmCloseId(null);
            fetchData();
        } catch (err) {
            showToast("Failed to close booking", "error");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ customerId: '', selectedAssetIds: [], returnDate: '' });
    };

    return (
        <div style={{ position: 'relative', minHeight: '80vh' }}>
            {toast.show && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white', padding: '12px 24px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '10px', zIndex: 3000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span style={{ fontWeight: '600' }}>{toast.message}</span>
                </div>
            )}

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontWeight: '900', color: '#1e293b' }}>RENTAL BOOKINGS</h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Track active schedules and equipment returns</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search customer..." 
                            style={{ padding: '8px 12px 8px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} 
                        onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> New Booking
                    </button>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <table className="mg-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Assets Booked</th>
                            <th>Expected Return</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.filter(b => `${b.customer?.firstName} ${b.customer?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map(booking => (
                            <tr 
                                key={booking.bookingId} 
                                onClick={() => setSelectedBooking(booking)} // Row click opens details
                                style={{ cursor: 'pointer' }}
                            >
                                <td style={{ fontWeight: '700' }}>{booking.customer?.firstName} {booking.customer?.lastName}</td>
                                <td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {booking.assetList?.map(a => (
                                            <span key={a.assetId} style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                                {a.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>{new Date(booking.returnDate).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-pill ${booking.status === 'ONGOING' ? 'status-rented' : 'status-available'}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {booking.status === 'ONGOING' && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                setConfirmCloseId(booking.bookingId);
                                            }}
                                            style={{ color: '#10b981', background: 'none', border: '1px solid #10b981', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                        >
                                            Return Items
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Custom Confirmation Modal */}
            {confirmCloseId && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(15, 23, 42, 0.6)', display: 'flex', 
                    justifyContent: 'center', alignItems: 'center', zIndex: 2000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '16px',
                        width: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ 
                            backgroundColor: '#ecfdf5', width: '60px', height: '60px', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', margin: '0 auto 20px' 
                        }}>
                            <CheckCircle size={32} color="#10b981" />
                        </div>
                        
                        <h3 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>
                            Confirm Return
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' }}>
                            Are you sure you want to mark these items as returned?
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setConfirmCloseId(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleCloseBooking(confirmCloseId)} className="btn-primary" style={{ background: '#10b981' }}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

           {isModalOpen && (
                <div style={modalStyles.overlay} onClick={closeModal}>
                    <div style={modalStyles.container} onClick={e => e.stopPropagation()}>
                        
                        <div style={modalStyles.header}>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: '#0f172a' }}>Create Booking</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Assign assets to a customer</p>
                            </div>
                            <button onClick={closeModal} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBooking} style={{ padding: '32px', overflowY: 'auto' }}>
                            
                            {/* Customer Section */}
                            <div style={{ marginBottom: '28px' }}>
                                <div style={modalStyles.sectionTitle}><User size={14}/> Customer Details</div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <select 
                                            required 
                                            className="mg-input"
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', appearance: 'none' }}
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                                        >
                                            <option value="">Select Customer...</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                                        </select>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCustomerPopupOpen(true)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#334155' }}
                                    >
                                        <UserPlus size={18} color="#3b82f6" />
                                        <span>Quick Add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Date Section */}
                            <div style={{ marginBottom: '28px' }}>
                                <div style={modalStyles.sectionTitle}><Calendar size={14}/> Timeline</div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '8px' }}>Scheduled Return Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    min={todayStr} 
                                    className="mg-input"
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                                    value={formData.returnDate}
                                    onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                                />
                            </div>

                            {/* Assets Grid Section */}
                            <div style={{ marginBottom: '10px' }}>
                                <div style={modalStyles.sectionTitle}><Package size={14}/> Select Equipment</div>
                                <div style={modalStyles.assetGrid}>
                                    {availableAssets.length > 0 ? availableAssets.map(asset => {
                                        const isSelected = formData.selectedAssetIds.includes(asset.assetId);
                                        return (
                                            <div 
                                                key={asset.assetId} 
                                                style={modalStyles.assetCard(isSelected)}
                                                onClick={() => {
                                                    const id = asset.assetId;
                                                    const newSelection = isSelected 
                                                        ? formData.selectedAssetIds.filter(item => item !== id)
                                                        : [...formData.selectedAssetIds, id];
                                                    setFormData({...formData, selectedAssetIds: newSelection});
                                                }}
                                            >
                                                <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? '#3b82f6' : 'transparent', borderColor: isSelected ? '#3b82f6' : '#cbd5e1' }}>
                                                    {isSelected && <CheckCircle size={14} color="white" />}
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{asset.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{asset.serialNumber || 'No SN'}</div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No items available for rent.</p>
                                    )}
                                </div>
                            </div>
                        </form>

                        <div style={modalStyles.footer}>
                            <button onClick={closeModal} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateBooking}
                                disabled={formData.selectedAssetIds.length === 0 || !formData.customerId || !formData.returnDate}
                                style={{ 
                                    flex: 2, padding: '14px', borderRadius: '12px', border: 'none', 
                                    background: (formData.selectedAssetIds.length === 0) ? '#cbd5e1' : '#3b82f6', 
                                    color: 'white', fontWeight: '700', cursor: (formData.selectedAssetIds.length === 0) ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                Confirm Rental
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <QuickCustomerModal 
                isOpen={isCustomerPopupOpen}
                onClose={() => setIsCustomerPopupOpen(false)}
                onCustomerCreated={handleCustomerCreated}
            />

            <BookingDetails 
                booking={selectedBooking} 
                onClose={() => setSelectedBooking(null)} 

            />
        </div>
    );
};

export default Bookings;