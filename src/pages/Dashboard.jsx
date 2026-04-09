import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Package, Calendar, Users, 
    FileText, LogOut, HardHat, BarChart3 
} from 'lucide-react';

import Overview from './sections/Overview';
import Equipments from './sections/Equipments';
import Bookings from './sections/Bookings';
import Customers from './sections/Customers';
import Invoices from './sections/Invoices';
import Reports from './sections/Reports'; 

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [autoOpenBooking, setAutoOpenBooking] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const handleNavigate = (section) => {
        if (section === 'booking-new') {
            setActiveSection('booking');
            setAutoOpenBooking(true);
        } else {
            setActiveSection(section);
            setAutoOpenBooking(false);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return <Overview onNavigate={handleNavigate} />; 
            case 'equipment': return <Equipments />;
            case 'booking':   return <Bookings initialOpen={autoOpenBooking}/>;
            case 'customers': return <Customers />;
            case 'invoice':   return <Invoices />;
            case 'reports':   return <Reports />; 
            default:          return <Overview onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HardHat size={32} color="#3b82f6" />
                    <h1 style={{ color: 'white', fontSize: '18px' }}>M&G ADMIN</h1>
                </div>

                <nav style={{ flex: 1 }}>
                    <NavItem id="dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeSection} onClick={handleNavigate} />
                    <NavItem id="equipment" icon={<Package size={20}/>} label="Equipments" active={activeSection} onClick={handleNavigate} />
                    <NavItem id="booking" icon={<Calendar size={20}/>} label="Booking" active={activeSection} onClick={handleNavigate} />
                    <NavItem id="customers" icon={<Users size={20}/>} label="Customers" active={activeSection} onClick={handleNavigate} />
                    <NavItem id="invoice" icon={<FileText size={20}/>} label="Invoice" active={activeSection} onClick={handleNavigate} />
                    <NavItem id="reports" icon={<BarChart3 size={20}/>} label="Reports" active={activeSection} onClick={handleNavigate} />
                </nav>

                <button onClick={handleLogout} className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '12px' }}>
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
};

const NavItem = ({ id, icon, label, active, onClick }) => (
    <div 
        onClick={() => onClick(id)}
        style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '8px',
            borderRadius: '8px', cursor: 'pointer', transition: '0.2s',
            backgroundColor: active === id ? '#2563eb' : 'transparent',
            color: active === id ? 'white' : '#94a3b8'
        }}
    >
        {icon} <span>{label}</span>
    </div>
);

export default Dashboard;