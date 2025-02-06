import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import './Admin.css';

const AdminDashboard = () => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const [logs, setLogs] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const venues = ['Room A101', 'Room B202', 'Library', 'Online'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [logsResponse, appointmentsResponse] = await Promise.all([
                    axios.get('http://127.0.0.1:5000/api/advisor/logs', {
                        params: { advisor_email: email, search: searchTerm, status: statusFilter }
                    }),
                    axios.get('http://127.0.0.1:5000/api/appoint', {
                        params: { advisor_email: email, search: searchTerm, status: statusFilter }
                    })
                ]);
                setLogs(logsResponse.data);
                setAppointments(appointmentsResponse.data);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [email, searchTerm, statusFilter]);

    const handleStatusChange = async (id, newStatus, type) => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/${type}/${id}`, {
                status: newStatus,
                reviewed_by: email
            });
            if (type === 'logs') {
                setLogs(logs.map(log => (log.id === id ? { ...log, status: newStatus } : log)));
            } else {
                setAppointments(appointments.map(appt => (appt._id === id ? { ...appt, status: newStatus } : appt)));
            }
        } catch (err) {
            setError('Error updating status');
            console.error(err);
        }
    };

    const handleVenueChange = async (id, newVenue) => {
        try {
            await axios.patch(`http://127.0.0.1:5000/api/appoint/${id}`, { venue: newVenue });
            setAppointments(appointments.map(appt => (appt._id === id ? { ...appt, venue: newVenue } : appt)));
        } catch (err) {
            setError('Error updating venue');
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'; // Prevent errors when date is null/undefined
        try {
            return format(parseISO(dateString), 'PP'); // Format date safely
        } catch (error) {
            console.error('Invalid date:', dateString);
            return 'Invalid Date';
        }
    };

    return (
        <div className="admin-container">
            <h1>Welcome, {name}!</h1>
            <div className="controls">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            {error && <div className="error">{error}</div>}
            {loading ? <p>Loading data...</p> : (
                <>
                    <h2>Logs</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Module</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td>{log.student_name}</td>
                                    <td>{log.department}</td>
                                    <td>{log.year}</td>
                                    <td>{log.module}</td>
                                    <td>{log.status}</td>
                                    <td>
                                        <button onClick={() => handleStatusChange(log.id, 'approved', 'logs')}>Approve</button>
                                   
                                    </td>
                                    <td>
                                    <button onClick={() => handleStatusChange(log.id, 'rejected', 'logs')}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h2>Appointments</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Student</th>
                                <th>Details</th>
                                <th>Venue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appt => (
                                <tr key={appt._id}>
                                    <td>{formatDate(appt.date)} • {appt.BookedTime}</td>
                                    <td>{appt.student_name}</td>
                                    <td>{appt.module}</td>
                                    <td>
                                        <select value={appt.venue} onChange={(e) => handleVenueChange(appt._id, e.target.value)}>
                                            {venues.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </td>
                                    <td>{appt.status}</td>
                                    <td>
                                        <button onClick={() => handleStatusChange(appt._id, 'confirmed', 'appoint')}>Confirm</button>
                                        

                                    </td>
                                    <td>
                                    <button onClick={() => handleStatusChange(appt._id, 'cancelled', 'appoint')}>Cancel</button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
