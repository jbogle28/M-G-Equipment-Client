import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { Plus, Search, Loader2, Edit2, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

const Equipments = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    // 1. ADD TOAST STATE
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({ 
        name: '', category: '', serialNumber: '', pricePerDay: '', status: 'AVAILABLE' 
    });

    // 2. ADD TOAST HELPER
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/assets');
            setItems(res.data);
        } catch (err) {
            showToast("Error fetching assets", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssets(); }, []);

    // 3.DELETE WITH 
    const handleDelete = async (item) => {

        const isActive = item.status === 'RENTED' || item.status === 'BOOKED';

        if (isActive) {
            showToast(`Cannot delete ${item.name}! It is currently with a customer.`, "error");
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) {
            try {
                await API.delete(`/api/assets/${item.assetId}`);
                showToast("Asset removed from inventory");
                fetchAssets();
            } catch (err) {
                showToast(err.response?.data?.error || "Delete failed: Item is linked to transaction records", "error");
            }
        }
    };

    // 4.EDIT
    const openEditModal = (item) => {
        const isActive = item.status === 'RENTED' || item.status === 'BOOKED';

        if (isActive) {
            showToast("Editing locked! Return the item to inventory before making changes.", "error");
            return;
        }
        
        setEditingItem(item);
        setFormData({ 
            name: item.name, 
            category: item.category, 
            serialNumber: item.serialNumber || '', 
            pricePerDay: item.pricePerDay.toString(), 
            status: item.status 
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { 
            ...formData, 
            pricePerDay: formData.pricePerDay === '' ? 0.0 : parseFloat(formData.pricePerDay) 
        };

        try {
            if (editingItem) {
                await API.put('/api/assets', { ...payload, assetId: editingItem.assetId });
                showToast("Asset updated successfully");
            } else {
                await API.post('/api/assets', payload);
                showToast("New asset added to stock");
            }
            closeModal();
            fetchAssets();
        } catch (err) {
            showToast("Operation failed: Check your data", "error");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', category: '', serialNumber: '', pricePerDay: '', status: 'AVAILABLE' });
    };

    const filteredItems = items.filter(item => 
        (item.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ position: 'relative' }}>
            {/* 5. THE TOAST NOTIFICATION UI */}
            {toast.show && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white', padding: '16px 24px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', gap: '12px', zIndex: 9999,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontWeight: '700' }}>{toast.message}</span>
                </div>
            )}

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontWeight: '900', color: '#1e293b' }}>INVENTORY MANAGEMENT</h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Track and manage M&G industrial assets</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search name or serial..." 
                            style={{ padding: '8px 12px 8px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} 
                        onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Add Asset
                    </button>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <table className="mg-table">
                    <thead>
                        <tr>
                            <th>Serial #</th>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Daily Rate</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.assetId}>
                                <td style={{ fontWeight: '700', color: '#64748b' }}>{item.serialNumber || 'N/A'}</td>
                                <td style={{ fontWeight: '600' }}>{item.name}</td>
                                <td>{item.category}</td>
                                <td>${item.pricePerDay}</td>
                                <td>
                                    <span className={`status-pill ${item.status === 'AVAILABLE' ? 'status-available' : 'status-rented'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {/* Edit Button with conditional styling */}
                                    <button 
                                        onClick={() => openEditModal(item)} 
                                        disabled={item.status === 'RENTED' || item.status === 'BOOKED'}
                                        style={{ 
                                            color: (item.status === 'RENTED' || item.status === 'BOOKED') ? '#cbd5e1' : '#2563eb', 
                                            background: 'none', 
                                            border: 'none', 
                                            marginRight: '15px', 
                                            cursor: (item.status === 'RENTED' || item.status === 'BOOKED') ? 'not-allowed' : 'pointer',
                                            transition: 'color 0.2s'
                                        }}
                                        title="Edit Item"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                            
                                    {/* Delete Button with conditional styling */}
                                <button 
                                    onClick={() => handleDelete(item)} 
                                    disabled={item.status === 'RENTED' || item.status === 'BOOKED'}
                                    style={{ 
                                        color: (item.status === 'RENTED' || item.status === 'BOOKED') ? '#cbd5e1' : '#ef4444', 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: (item.status === 'RENTED' || item.status === 'BOOKED') ? 'not-allowed' : 'pointer',
                                        transition: 'color 0.2s'
                                    }}
                                    title="Delete Item"
                                >
                                    <Trash2 size={18} />
                                </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal remains the same but uses closeModal helper */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
                    <div className="modal-content" style={{ width: '400px', background: 'white', height: '100%', padding: '40px', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <h3 style={{ fontWeight: '800' }}>{editingItem ? 'Edit Asset' : 'Add New Asset'}</h3>
                            <X onClick={closeModal} style={{ cursor: 'pointer' }} />
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Asset Name</label>
                                <input 
                                    type="text" required 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Serial Number</label>
                                <input 
                                    type="text" required 
                                    placeholder="e.g. MG-10293"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Category</label>
                                <select 
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Heavy Machinery">Heavy Machinery</option>
                                    <option value="Power Tools">Power Tools</option>
                                    <option value="Safety Gear">Safety Gear</option>
                                    <option value="AV Equipment">AV Equipment</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Price Per Day ($)</label>
                                <input 
                                    type="number" step="0.01" required 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.pricePerDay}
                                    onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Status</label>
                                <select 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="RENTED">Rented</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                                {editingItem ? 'Save Changes' : 'Add to Inventory'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Equipments;