import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ studentNumber }) => {
    
    return (
        <div className="sidebar">
            <img
                src="images/uct.jpg"
                alt="Student Success Hub"
                className="login-logo"
            />
            <div className="logo">Admin Dashboard</div>

            <ul>
                <li><Link to="/AdminPage">Home</Link></li>
                <li><Link to="#">Bookings</Link></li>
                <li><Link to="/analytics">Analytics</Link></li>
                <li><Link to="#">Report</Link></li>
                <li><Link to="/resources">Resources</Link></li>
                {studentNumber === "admin5" && (
                    <li><Link to="/superuser">Admin</Link></li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
