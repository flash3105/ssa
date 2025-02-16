import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Table, Button, Input, Select, Modal } from 'antd';
import './Admin.css';

const { Option } = Select;

const AdminDashboard = () => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const [logs, setLogs] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const venues = ['Room A101', 'Room B202', 'Library', 'Online'];

    // Fetch Logs & Appointments
    useEffect(() => {
        const fetchData = async () => {
            if (!email) return; // Ensure email is available before making a request

            try {
                setLoading(true);
                const { data } = await axios.get('http://127.0.0.1:5000/api/advisor/logs', {
                    params: { advisor_email: email, search: searchTerm, status: statusFilter }
                });

                // Filter confirmed & unconfirmed appointments
                const unconfirmedLogs = data.filter(log => !log.confirmed);
                const confirmedAppointments = data.filter(log => log.confirmed);

                setLogs(unconfirmedLogs);
                setAppointments(confirmedAppointments);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [email, searchTerm, statusFilter]);

    // Handles Status Change (Approve, Reject, Confirm, Cancel)
    const handleStatusChange = async (id, newStatus, type) => {
        try {
            const endpoint = type === 'appoint' && newStatus === 'confirmed'
                ? `/api/appointment/confirm/${id}`
                : `/api/${type}/${id}`;

            await axios.put(`http://127.0.0.1:5000${endpoint}`, { status: newStatus, reviewed_by: email });

            const updateState = (items) =>
                items.map(item => (item._id === id ? { ...item, status: newStatus } : item));

            type === 'logs' ? setLogs(updateState(logs)) : setAppointments(updateState(appointments));
        } catch (err) {
            setError('Error updating status');
            console.error(err);
        }
    };

    // Handles Venue Change
    const handleVenueChange = async (id, newVenue) => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/appointment/venue/${id}`, {
                venue: newVenue  // Send venue in the request body
            });
            setAppointments(appointments.map(appt => (appt._id === id ? { ...appt, venue: newVenue } : appt)));
        } catch (err) {
            setError('Error updating venue');
            console.error('Axios error:', err);
        }
    };
    
    
    

    // Formats Date Safely
    const formatDate = (dateString) => {
        if (!dateString) return 'TBD'; // Placeholder for missing dates
        try {
            return format(parseISO(dateString), 'PP'); // Format date safely
        } catch (error) {
            console.error('Invalid date:', dateString);
            return 'Invalid Date';
        }
    };

    // Table Columns Definition
    const logColumns = [
        { title: 'Date & Time', dataIndex: 'date', key: 'date', render: (text, record) => formatDate(record.date) + ' • ' + record.BookedTime },
        { title: 'Student Name', dataIndex: 'student_name', key: 'student_name' },
        { title: 'Department', dataIndex: 'department', key: 'department' },
        { title: 'Year', dataIndex: 'year', key: 'year' },
        { title: 'Module', dataIndex: 'module', key: 'module' },
        {
            title: 'Actions', key: 'actions', render: (text, record) => (
                <>
                    <Button onClick={() => handleStatusChange(record._id, 'confirmed', 'appoint')} type="primary">Confirm</Button>
                    <Button onClick={() => handleStatusChange(record._id, 'cancelled', 'appoint')} type="danger">Cancel</Button>
                </>
            )
        }
    ];

    const appointmentColumns = [
        { title: 'Date & Time', dataIndex: 'date', key: 'date', render: (text, record) => formatDate(record.date) + ' • ' + record.BookedTime },
        { title: 'Student', dataIndex: 'student_name', key: 'student_name' },
        { title: 'Details', dataIndex: 'module', key: 'module' },
        {
            title: 'Venue', key: 'venue', render: (text, record) => (
                <Select value={record.venue} onChange={(value) => handleVenueChange(record._id, value)}>
                    {venues.map(v => <Option key={v} value={v}>{v}</Option>)}
                </Select>
            )
        },
        { title: 'Status', dataIndex: 'status', key: 'status' },
       {/* {
            title: 'Actions', key: 'actions', render: (text, record) => (
                <>
                    <Button onClick={() => handleStatusChange(record._id, 'confirmed', 'appoint')} type="primary">Reschedule</Button>
                    <Button onClick={() => handleStatusChange(record._id, 'cancelled', 'appoint')} type="danger">Cancel</Button>
                </>
            )
        }*/}
    ];

    return (
        <div className="admin-container">
            <h1>Welcome, {name}!</h1>

            {/* Search & Filter Controls */}
            <div className="controls">
                <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px', marginRight: '10px' }}
                />
                <Select
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    style={{ width: '200px' }}
                >
                    <Option value="all">All Statuses</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="approved">Approved</Option>
                    <Option value="rejected">Rejected</Option>
                    <Option value="confirmed">Confirmed</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="cancelled">Cancelled</Option>
                </Select>
            </div>

            {/* Error Message */}
            {error && <div className="error">{error}</div>}

            {/* Loading Indicator */}
            {loading ? <p className="loading">Loading data...</p> : (
                <>
                    {/* Logs Table */}
                    <h2>Logs</h2>
                    <Table
                        columns={logColumns}
                        dataSource={logs}
                        rowKey="_id"
                        pagination={{ pageSize: 5 }}
                    />

                    {/* Appointments Table */}
                    <h2>Appointments</h2>
                    <Table
                        columns={appointmentColumns}
                        dataSource={appointments}
                        rowKey="_id"
                        pagination={{ pageSize: 5 }}
                    />
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
