import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import InvoiceDetail from '../components/InvoiceDetail'; // Ensure this path is correct
import { 
    FileText, CheckCircle, Clock, AlertCircle, Loader2, 
    Search, Filter, Download, CreditCard, Trash2, Edit2, Eye 
} from 'lucide-react';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // NEW: State for the side modal
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/invoices');
            setInvoices(res.data);
        } catch (err) {
            showToast("Failed to load invoices", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    // NEW: Function to call your server's PDF exporter
    const handleDownloadPDF = async (id) => {
        try {
            // Using blob response type for file downloads
            const response = await API.get(`/api/invoices/${id}/download`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast("Downloading invoice...");
        } catch (err) {
            showToast("Failed to download PDF", "error");
        }
    };

    const handlePayInvoice = async (id) => {
        try {
            await API.put(`/api/invoices/${id}/pay`);
            showToast("Payment processed successfully!");
            fetchInvoices();
        } catch (err) {
            showToast(err.response?.data?.error || "Payment failed", "error");
        }
    };

    const handleDeleteInvoice = async (inv) => {
        if (inv.status !== 'PAID') {
            showToast("Cannot delete unpaid invoices. Mark as paid first.", "error");
            return;
        }

        if (window.confirm(`Are you sure you want to delete Invoice #INV-${inv.invoiceId}?`)) {
            try {
                const res = await API.delete(`/api/invoices/${inv.invoiceId}`);
                showToast(res.data.message || "Invoice deleted");
                fetchInvoices();
            } catch (err) {
                showToast(err.response?.data?.error || "Delete failed", "error");
            }
        }
    };

    const handleEditInvoice = (inv) => {
        if (inv.status === 'PAID') {
            showToast("Paid invoices are locked and cannot be edited.", "error");
            return;
        }
        showToast("Edit mode for Invoice #" + inv.invoiceId, "success");
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             inv.invoiceId.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ padding: '20px', position: 'relative' }}>
            {/* TOAST Logic stays same */}
            {toast.show && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white', padding: '12px 24px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '10px', zIndex: 3000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span style={{ fontWeight: '600' }}>{toast.message}</span>
                </div>
            )}

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontWeight: '900', color: '#1e293b', margin: 0 }}>INVOICE MANAGEMENT</h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Manage billing and payment collections</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Invoice # or Client..." 
                            style={{ padding: '8px 12px 8px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                    </select>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <table className="mg-table">
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Client</th>
                            <th>Date Created</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(inv => (
                            <tr key={inv.invoiceId}>
                                <td style={{ fontWeight: '700' }}>#INV-{inv.invoiceId}</td>
                                <td>{inv.clientName || "Walk-in Customer"}</td>
                                <td>{new Date(inv.creationDate).toLocaleDateString()}</td>
                                <td style={{ fontWeight: '600' }}>${inv.total?.toFixed(2)}</td>
                                <td>
                                    <span className={`status-pill ${inv.status === 'PAID' ? 'status-available' : 'status-rented'}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                                        {/* NEW: Detail View Button */}
                                        <button 
                                            onClick={() => setSelectedInvoice(inv)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {/* NEW: Download PDF Button */}
                                        <button 
                                            onClick={() => handleDownloadPDF(inv.invoiceId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}
                                            title="Download PDF"
                                        >
                                            <Download size={18} />
                                        </button>

                                        <button 
                                            onClick={() => handleEditInvoice(inv)}
                                            style={{ background: 'none', border: 'none', cursor: inv.status === 'PAID' ? 'not-allowed' : 'pointer', color: inv.status === 'PAID' ? '#cbd5e1' : '#64748b' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteInvoice(inv)}
                                            style={{ background: 'none', border: 'none', cursor: inv.status !== 'PAID' ? 'not-allowed' : 'pointer', color: inv.status !== 'PAID' ? '#cbd5e1' : '#ef4444' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        {inv.status !== 'PAID' && (
                                            <button 
                                                onClick={() => handlePayInvoice(inv.invoiceId)}
                                                className="btn-pay-small" // Adjust your CSS for this
                                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #2563eb', cursor: 'pointer' }}
                                            >
                                                <CreditCard size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* SIDE MODAL RENDERING */}
            {selectedInvoice && (
                <InvoiceDetail 
                    invoice={selectedInvoice} 
                    onClose={() => setSelectedInvoice(null)} 
                    onDownload={handleDownloadPDF}
                />
            )}
        </div>
    );
};

export default Invoices;