import React from 'react';
import { X, Download, Calendar, User, Package, CreditCard, Hash, Clock } from 'lucide-react';

const InvoiceDetail = ({ invoice, onClose, onDownload }) => {
    if (!invoice) return null;

    const booking = invoice.booking || {};
    const customer = booking.customer || {};
    const days = booking.dayCount || 1; // Default to 1 if not calculated

    const styles = {
        overlay: {
            position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end',
        },
        content: {
            width: '500px', height: '100%', backgroundColor: '#ffffff',
            boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.1)', display: 'flex',
            flexDirection: 'column', animation: 'slideIn 0.3s ease-out',
        },
        header: {
            padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc'
        },
        body: { flex: 1, padding: '24px', overflowY: 'auto' },
        sectionTitle: {
            fontSize: '12px', fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '8px'
        },
        infoCard: {
            padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0',
            backgroundColor: '#fff', marginBottom: '24px'
        },
        tableHeader: {
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '10px 0', borderBottom: '2px solid #f1f5f9',
            fontSize: '12px', fontWeight: 700, color: '#94a3b8'
        },
        tableRow: {
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '12px 0', borderBottom: '1px solid #f1f5f9',
            fontSize: '13px', color: '#1e293b', alignItems: 'center'
        },
        footer: {
            padding: '24px', borderTop: '1px solid #e2e8f0',
            display: 'flex', gap: '12px', background: '#f8fafc'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.content} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Invoice Details</h2>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>#{invoice.invoiceId} • Issued {new Date(invoice.issuedDate).toLocaleDateString()}</span>
                    </div>
                    <X size={24} onClick={onClose} style={{ cursor: 'pointer', color: '#64748b' }} />
                </div>

                <div style={styles.body}>
                    {/* Status & Customer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <div style={styles.sectionTitle}><User size={14}/> Billed To</div>
                            <strong style={{ fontSize: '16px', color: '#1e293b' }}>{customer.firstName} {customer.lastName}</strong>
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{customer.email}</p>
                        </div>
                        <span className={`status-pill ${invoice.status === 'PAID' ? 'status-available' : 'status-rented'}`} style={{ padding: '6px 16px' }}>
                            {invoice.status}
                        </span>
                    </div>

                    {/* Rental Period */}
                    <div style={styles.infoCard}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={styles.sectionTitle}><Calendar size={14}/> Rental Period</div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                                    {new Date(booking.bookDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <div style={styles.sectionTitle}><Clock size={14}/> Duration</div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>{days} Day(s)</p>
                            </div>
                        </div>
                    </div>

                    {/* ITEMIZED BREAKDOWN */}
                    <div style={styles.sectionTitle}><Package size={14}/> Itemized Breakdown</div>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={styles.tableHeader}>
                            <span>ITEM DESCRIPTION</span>
                            <span style={{ textAlign: 'center' }}>RATE</span>
                            <span style={{ textAlign: 'center' }}>DAYS</span>
                            <span style={{ textAlign: 'right' }}>AMOUNT</span>
                        </div>
                        {booking.assetList?.map((asset) => (
                            <div key={asset.assetId} style={styles.tableRow}>
                                <span style={{ fontWeight: 600 }}>{asset.name}</span>
                                <span style={{ textAlign: 'center', color: '#64748b' }}>${asset.pricePerDay.toFixed(2)}</span>
                                <span style={{ textAlign: 'center', color: '#64748b' }}>{days}</span>
                                <span style={{ textAlign: 'right', fontWeight: 700 }}>
                                    ${(asset.pricePerDay * days).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* TOTALS SECTION */}
                    <div style={{ marginLeft: 'auto', width: '200px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                            <span style={{ color: '#64748b' }}>Subtotal</span>
                            <span style={{ fontWeight: 600 }}>${(invoice.total - invoice.tax).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                            <span style={{ color: '#64748b' }}>Tax (15% GCT)</span>
                            <span style={{ fontWeight: 600 }}>${invoice.tax?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px solid #0f172a' }}>
                            <span style={{ fontWeight: 800, fontSize: '16px' }}>Total</span>
                            <span style={{ fontWeight: 800, fontSize: '18px', color: '#2563eb' }}>${invoice.total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <button 
                        onClick={onClose}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => onDownload(invoice.invoiceId)}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>
            
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}
            </style>
        </div>
    );
};

export default InvoiceDetail;