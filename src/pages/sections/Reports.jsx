import React, { useState } from 'react';
import { 
    Download, FileText, Calendar, 
    TrendingUp, Package, Loader2 
} from 'lucide-react';
import API from '../../api/axiosConfig';

const Reports = () => {
    const [reportType, setReportType] = useState('income');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!dateRange.start || !dateRange.end) {
            alert("Please select both a start and end date.");
            return;
        }

        setLoading(true);
        try {
            const startStr = `${dateRange.start}T00:00:00`;
            const endStr = `${dateRange.end}T23:59:59`;

            const endpoint = reportType === 'income' 
                ? '/api/reports/income' 
                : '/api/reports/usage';

            const res = await API.get(endpoint, {
                params: { start: startStr, end: endStr }
            });

            if (reportType === 'income') {
                setReportData({
                    generatedAt: new Date(res.data.generatedAt).toLocaleString(),
                    summary: `$${res.data.summary.toLocaleString()}`,
                    details: res.data.details.map(inv => ({
                        id: inv.invoiceId,
                        date: inv.creationDate.split('T')[0],
                        label: `Invoice #${inv.invoiceId} - ${inv.clientName}`,
                        value: `$${inv.total.toLocaleString()}`
                    }))
                });
            } else {
                setReportData({
                    generatedAt: new Date(res.data.generatedAt).toLocaleString(),
                    summary: res.data.summary,
                    details: res.data.details.map((item, idx) => ({
                        id: idx,
                        date: "Ranked",
                        label: item.label,
                        value: item.value
                    }))
                });
            }
        } catch (err) {
            console.error("Report generation failed", err);
            alert("Error connecting to report server.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleExportPDF = async () => {
        if (!dateRange.start || !dateRange.end) return;
        
        const startStr = `${dateRange.start}T00:00:00`;
        const endStr = `${dateRange.end}T23:59:59`;
        const type = reportType === 'income' ? 'income' : 'usage';
        const fileName = `MG_Equipment_${reportType === 'income' ? 'Income' : 'Usage'}_Report.pdf`;

        try {
            const response = await API.get(`/api/reports/download/${type}`, {
                params: { start: startStr, end: endStr },
                responseType: 'blob', // Critical for binary data
            });
            
            // Create a local URL for the binary data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download PDF", err);
            alert("Error generating PDF file.");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ fontWeight: '900', color: '#1e293b' }}>SYSTEM REPORTS</h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Analyze business performance and financial data</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* CONFIGURATION PANEL */}
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Report Configuration</h3>
                    <form onSubmit={handleGenerate}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Select Report Type</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <ReportOption 
                                    active={reportType === 'income'} 
                                    onClick={() => { setReportType('income'); setReportData(null); }}
                                    icon={<TrendingUp size={18} />}
                                    title="Income Report"
                                    desc="Total revenue earned in period"
                                />
                                <ReportOption 
                                    active={reportType === 'assets'} 
                                    onClick={() => { setReportType('assets'); setReportData(null); }}
                                    icon={<Package size={18} />}
                                    title="Asset Utilization"
                                    desc="Track booking frequency"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={labelStyle}>Date Range</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="date" 
                                    style={inputStyle} 
                                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                />
                                <input 
                                    type="date" 
                                    style={inputStyle}
                                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
                            Generate Report
                        </button>
                    </form>
                </div>

                {/* RESULTS PREVIEW */}
                <div style={cardStyle}>
                    {!reportData && !loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                            <FileText size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                            <p>Configure and generate a report to view data here.</p>
                        </div>
                    ) : loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <Loader2 className="animate-spin" size={40} style={{ color: '#2563eb', margin: '0 auto' }} />
                            <p style={{ marginTop: '15px', color: '#64748b' }}>Querying database...</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={cardTitleStyle}>Preview: {reportType === 'income' ? 'Income Analysis' : 'Usage Analysis'}</h3>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Generated: {reportData.generatedAt}</p>
                                </div>
                                {/* HOOKED UP EXPORT BUTTON */}
                                <button 
                                    onClick={handleExportPDF}
                                    style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '6px', display: 'flex', gap: '6px', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    <Download size={16} /> Export PDF
                                </button>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
                                    {reportType === 'income' ? 'Total Revenue' : 'Total Activity'}
                                </span>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>{reportData.summary}</div>
                            </div>

                            <table className="mg-table">
                                <thead>
                                    <tr>
                                        <th>{reportType === 'income' ? 'Date' : 'Category'}</th>
                                        <th>Description</th>
                                        <th style={{ textAlign: 'right' }}>{reportType === 'income' ? 'Amount' : 'Usage'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.details.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.date}</td>
                                            <td>{item.label}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '700' }}>{item.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReportOption = ({ active, onClick, icon, title, desc }) => (
    <div 
        onClick={onClick}
        style={{
            padding: '12px', borderRadius: '10px', border: active ? '2px solid #2563eb' : '1px solid #e2e8f0',
            backgroundColor: active ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center'
        }}
    >
        <div style={{ color: active ? '#2563eb' : '#64748b', backgroundColor: active ? 'white' : '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: active ? '#1e40af' : '#1e293b' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{desc}</div>
        </div>
    </div>
);

const cardStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const cardTitleStyle = { fontSize: '16px', fontWeight: '700', marginBottom: '4px', marginTop: 0 };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };

export default Reports;