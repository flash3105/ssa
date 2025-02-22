import React, { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import "./Bookings.css"; // Add your styling here


const Bookings = () => {
    const API_URL = "https://ssa-fyk5.onrender.com";
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [availableTimes, setAvailableTimes] = useState([
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM",
    ]); // Example times
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    // Retrieve stored values
    const studentEmail = localStorage.getItem("email");
    const studentName = localStorage.getItem("name");
    const department = localStorage.getItem("selectedDepartment");
    const module = localStorage.getItem("selectedModule");
    const tutorOrAdvisor = localStorage.getItem("selectedTutorOrAdvisor");
    const selectedYear = localStorage.getItem("selectedYear");
    const name = localStorage.getItem("AdminName");
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleTimeClick = (time) => {
        setSelectedTime(time);
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) {
            setErrorMessage("Please select a date and time.");
            return;
        }

        const bookingLog = {
            student_email:studentEmail,
            student_name: studentName,
            department,
            module,
            year: selectedYear,
            advisor_email: tutorOrAdvisor,
            date: selectedDate,
            time: selectedTime,
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await axios.post(`${API_URL}/api/log`, bookingLog);
            setSuccessMessage("Booking successful! Thank you.");
            setErrorMessage("");
            console.log("Booking logged:", response.data);
            console.log(bookingLog);
            navigate('/home');
        } catch (error) {
            setErrorMessage("Failed to log booking. Please try again.");
            console.error("Error logging booking:", error);
        }
    };

    return (
        <div className="bookings-container">
            <h1 className="title">Book an Appointment</h1>
            <p className="description">Select a date and time to book your appointment with {name}.</p>

            <div className="calendar-section">
                <label htmlFor="date">Select a Date:</label>
                <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="date-picker"
                />
            </div>

            <div className="times-section">
                <h3>Available Times:</h3>
                <div className="time-options">
                    {availableTimes.map((time) => (
                        <button
                            key={time}
                            className={`time-button ${selectedTime === time ? "selected" : ""}`}
                            onClick={() => handleTimeClick(time)}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            <div className="actions">
                {successMessage && <p className="success-message">{successMessage}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button onClick={handleBooking} className="booking-button">
                    Confirm Booking
                </button>
            </div>
        </div>
    );
};

export default Bookings;
