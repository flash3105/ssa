import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';
import { format } from 'date-fns';

const Admin = () => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Enhanced log fetching with filters
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://127.0.0.1:5000/api/advisor/logs', {
                    params: { 
                        advisor_email: email,
                        search: searchTerm,
                        status: selectedStatus
                    }
                });
                setLogs(response.data);
            } catch (err) {
                setError('Error fetching logs. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [email, searchTerm, selectedStatus]);

    // Approve/Reject log handler
    const handleStatusChange = async (logId, newStatus) => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/logs/${logId}`, {
                status: newStatus,
                reviewed_by: email
            });
            
            setLogs(logs.map(log => 
                log.id === logId ? { ...log, status: newStatus } : log
            ));
        } catch (err) {
            setError('Error updating log status');
            console.error(err);
        }
    };

    // Enhanced date formatting
    const formatDate = (timestamp) => {
        return format(new Date(timestamp), 'PPpp');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Welcome, {name}!</h1>
                <div className="admin-controls">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select 
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-indicator">Loading logs...</div>
            ) : logs.length > 0 ? (
                <div className="logs-container">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Module</th>
                                <th>Status</th>
                                <th>Timestamp</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className={`status-${log.status}`}>
                                    <td>{log.student_name}</td>
                                    <td>{log.department}</td>
                                    <td>{log.year}</td>
                                    <td>{log.module}</td>
                                    <td>
                                        <span className={`status-badge ${log.status}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(log.timestamp)}</td>
                                    <td className="actions">
                                        {log.status !== 'approved' && (
                                            <button 
                                                onClick={() => handleStatusChange(log.id, 'approved')}
                                                className="approve-btn"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {log.status !== 'rejected' && (
                                            <button 
                                                onClick={() => handleStatusChange(log.id, 'rejected')}
                                                className="reject-btn"
                                            >
                                                Reject
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="no-logs">No logs found matching your criteria.</p>
            )}
        </div>
    );
};

export default Admin;