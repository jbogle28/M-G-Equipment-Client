import React from 'react';
import { X, Calendar, User, Package, DollarSign, Clock } from 'lucide-react';

const BookingDetails = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.5)', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', zIndex: 2500,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal-content" style={{
                width: '500px', background: 'white', borderRadius: '16px',
                padding: '0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Booking Details</h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>ID: #{booking.bookingId}</span>
                    </div>
                    <X onClick={onClose} style={{ cursor: 'pointer', color: '#64748b' }} />
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Customer Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px' }}>
                            <User color="#3b82f6" size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Customer</p>
                            <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>{booking.customer?.firstName} {booking.customer?.lastName}</p>
                        </div>
                    </div>

                    {/* Dates Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={16} color="#64748b" />
                            <div>
                                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Booked On</p>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{new Date(booking.bookDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={16} color="#64748b" />
                            <div>
                                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Expected Return</p>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{new Date(booking.returnDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Asset List Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Package size={14} /> EQUIPMENT BOOKED
                        </p>
                        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            {booking.assetList?.map((asset, idx) => (
                                <div key={asset.assetId} style={{ 
                                    padding: '12px 16px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    borderBottom: idx === booking.assetList.length - 1 ? 'none' : '1px solid #e2e8f0'
                                }}>
                                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>{asset.name}</span>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>${asset.pricePerDay}/day</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Pill */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span className={`status-pill ${booking.status === 'ONGOING' ? 'status-rented' : 'status-available'}`} style={{ padding: '8px 24px', fontSize: '14px' }}>
                            {booking.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;