import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles
import './Calendar.css'; // Custom styles

const CalendarComp = ({ onDateSelect }) => {
    const [date, setDate] = useState(new Date());

    const handleDateChange = (selectedDate) => {
        setDate(selectedDate);
        if (onDateSelect) {
            onDateSelect(selectedDate);
        }
    };

    return (
        <div className="calendar-container">
            
            <Calendar onChange={handleDateChange} value={date} />
          
        </div>
    );
};

export default CalendarComp;
