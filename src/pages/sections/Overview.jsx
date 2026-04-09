import React, { useState, useEffect } from 'react';
import { 
    Activity, Package, AlertTriangle, FileText, Users, 
    PlusCircle, UserPlus, ArrowRightCircle, Download, 
    Calendar, CheckCircle2, Clock
} from 'lucide-react';
import API from '../../api/axiosConfig';


const Overview = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        activeRentals: 0,
        availableAssets: 0,
        overdueReturns: 0,
        pendingInvoices: 0,
        totalCustomers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get('/api/dashboard/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Dashboard data load failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading System Data...</div>;
    }

    return (
        <div style={containerStyles}>
            <header style={headerStyles}>
                <div>
                    <h1 style={{ fontWeight: '900', color: '#0f172a', margin: 0, fontSize: '2rem' }}>System Overview</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Real-time operational health and quick controls</p>
                </div>
                <div style={dateDisplayStyles}>
                    <Calendar size={18} />
                    <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </header>

            {/* 1. KEY METRICS BAR */}
            <div style={statsGridStyles}>
                <StatCard 
                    label="Active Rentals" 
                    value={stats.activeRentals} 
                    icon={<Activity />} 
                    color="#3b82f6" 
                    desc="Gear currently in field"
                />
                <StatCard 
                    label="Fleet Available" 
                    value={stats.availableAssets} 
                    icon={<Package />} 
                    color="#10b981" 
                    desc="Ready for checkout"
                />
                <StatCard 
                    label="Overdue Returns" 
                    value={stats.overdueReturns} 
                    icon={<AlertTriangle />} 
                    color="#ef4444" 
                    desc="Immediate action required"
                />
                <StatCard 
                    label="Pending Invoices" 
                    value={stats.pendingInvoices} 
                    icon={<FileText />} 
                    color="#f59e0b" 
                    desc="Awaiting payment"
                />
            </div>

            <div style={mainContentGrid}>
                {/* 2. QUICK ACTIONS PANEL */}
                <section style={panelStyles}>
                    <h3 style={panelTitleStyles}>Quick Actions</h3>
                    <div style={actionsGridStyles}>
                        <ActionButton 
                            title="Create Booking" 
                            subtitle="Start a new rental"
                            icon={<PlusCircle />} 
                            color="#3b82f6" 
                            onClick={() => onNavigate('booking-new')}
                        />
                        <ActionButton 
                            title="Register Client" 
                            subtitle="Add to directory"
                            icon={<UserPlus />} 
                            color="#8b5cf6" 
                            onClick={() => onNavigate('customers')} 
                        />
                        <ActionButton 
                            title="Manage Invoices" 
                            subtitle="View unpaid records"
                            icon={<ArrowRightCircle />} 
                            color="#10b981" 
                            onClick={() => onNavigate('invoice')} 
                        />
                        <ActionButton 
                            title="System Report" 
                            subtitle="Export CSV data"
                            icon={<Download />} 
                            color="#64748b" 
                            onClick={() => onNavigate('reports')} 
                        />
                    </div>
                </section>

                {/* 3. OPERATIONAL FOCUS LIST */}
                <section style={panelStyles}>
                    <h3 style={panelTitleStyles}>Priority Watchlist</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.overdueReturns > 0 ? (
                            <div 
                                style={{...alertItemStyles, cursor: 'pointer'}} 
                                onClick={() => onNavigate('booking')}
                            >
                                <div style={alertIconStyles}><Clock size={20} /></div>
                                <div>
                                    <p style={{ fontWeight: '700', margin: 0 }}>{stats.overdueReturns} Late Items Detected</p>
                                    <p style={{ fontSize: '13px', color: '#991b1b', margin: 0 }}>Click to review overdue rentals.</p>
                                </div>
                            </div>
                        ) : (
                            <div style={successItemStyles}>
                                <CheckCircle2 size={20} color="#10b981" />
                                <span style={{ fontWeight: '600' }}>All rentals are on schedule</span>
                            </div>
                        )}
                        
                        <div style={infoBoxStyles}>
                            <Users size={18} />
                            <span style={{ fontSize: '14px' }}>
                                <strong>{stats.totalCustomers}</strong> Total Customers registered
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, icon, color, desc }) => (
    <div style={statCardStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{label}</p>
                <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1e293b' }}>{value}</h2>
            </div>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
        </div>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>{desc}</p>
    </div>
);

const ActionButton = ({ title, subtitle, icon, color, onClick }) => (
    <div 
        style={actionBtnStyles} 
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = color}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
    >
        <div style={{ color: color, marginBottom: '10px', pointerEvents: 'none' }}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px', pointerEvents: 'none' }}>
            {title}
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', pointerEvents: 'none' }}>
            {subtitle}
        </div>
    </div>
);

// --- STYLES ---
const containerStyles = { padding: '40px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' };
const headerStyles = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const dateDisplayStyles = { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '20px' };
const statsGridStyles = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' };
const mainContentGrid = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' };
const statCardStyles = { backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const panelStyles = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const panelTitleStyles = { fontWeight: '800', fontSize: '18px', color: '#1e293b', marginBottom: '24px', marginTop: 0 };
const actionsGridStyles = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' };
const actionBtnStyles = { 
    padding: '24px', 
    borderRadius: '16px', 
    border: '1.5px dashed #e2e8f0', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    userSelect: 'none'
};
const alertItemStyles = { display: 'flex', gap: '15px', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fee2e2', color: '#991b1b' };
const alertIconStyles = { backgroundColor: '#ef4444', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const successItemStyles = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #dcfce7', color: '#166534' };
const infoBoxStyles = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#475569' };

export default Overview;