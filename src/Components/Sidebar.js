import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
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
                <li><Link to="#">Analytics</Link></li>
                <li><Link to="#">Report</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;
