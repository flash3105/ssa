import React from 'react';
import Admin from './Admin';
import AppointmentLister from '../Components/AppointmentLister';
import Sidebar from '../Components/Sidebar';
import AdminDashboard from './AdminDashboard';

import CalendarComp from '../Components/CalenderComp';

function AdminPage(){
    const studentNumber = localStorage.getItem('studentNo');
    return(
        <>
        
            <AdminDashboard/>
            <Sidebar studentNumber={studentNumber} />
            <CalendarComp/>

          

        </>
    );
}

export default AdminPage;