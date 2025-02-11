import React from 'react';
import Admin from './Admin';
import AppointmentLister from '../Components/AppointmentLister';
import Sidebar from '../Components/Sidebar';
import AdminDashboard from './AdminDashboard';

import CalendarComp from '../Components/CalenderComp';

function AdminPage(){
    return(
        <>
            <AdminDashboard/>
            <Sidebar/>
            <CalendarComp/>

          

        </>
    );
}

export default AdminPage;