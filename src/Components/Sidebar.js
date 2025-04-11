import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  CalendarOutlined,
  LineChartOutlined,
  FileTextOutlined,
  FolderOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './Sidebar.css';

const Sidebar = ({ studentNumber }) => {
  const location = useLocation();

  // Map routes to menu keys
  const getSelectedKey = () => {
    switch (location.pathname) {
      case '/AdminPage':
        return '1';
      case '/bookings': // Update this to match your actual route
        return '2';
      case '/analytics':
        return '3';
      case '/report': // Update this to match your actual route
        return '4';
      case '/resources':
        return '5';
      case '/superuser':
        return '6';
      default:
        return '1';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img
          src="images/uct.jpg"
          alt="Student Success Hub"
          className="login-logo"
        />
        <div className="logo">Admin Dashboard</div>
      </div>

      <ul className="sidebar-menu">
        <li className={getSelectedKey() === '1' ? 'selected' : ''}>
          <Link to="/AdminPage">
            <HomeOutlined className="menu-icon" />
            <span>Home</span>
          </Link>
        </li>
       /* <li className={getSelectedKey() === '2' ? 'selected' : ''}>
          <Link to="/bookings">
            <CalendarOutlined className="menu-icon" />
            <span>Bookings</span>
          </Link>*/
        </li>
        <li className={getSelectedKey() === '3' ? 'selected' : ''}>
          <Link to="/analytics">
            <LineChartOutlined className="menu-icon" />
            <span>Analytics</span>
          </Link>
        </li>
        <li className={getSelectedKey() === '4' ? 'selected' : ''}>
          <Link to="/report">
            <FileTextOutlined className="menu-icon" />
            <span>Report</span>
          </Link>
        </li>
        <li className={getSelectedKey() === '5' ? 'selected' : ''}>
          <Link to="/resources">
            <FolderOutlined className="menu-icon" />
            <span>Resources</span>
          </Link>
        </li>
        {studentNumber === "admin5" && (
          <li className={getSelectedKey() === '6' ? 'selected' : ''}>
            <Link to="/superuser">
              <UserOutlined className="menu-icon" />
              <span>Admin</span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
