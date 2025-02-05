import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AppointmentLister.css";
import { format, parseISO } from "date-fns";

const AppointmentLister = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const venues = ["Room A101", "Room B202", "Library", "Online"];
    const email = localStorage.getItem("email");

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://127.0.0.1:5000/api/appoint", {
                    params: {
                        advisor_email: email,
                        search: searchTerm,
                        status: statusFilter
                    }
                });
                setAppointments(response.data);
            } catch (err) {
                setError("Failed to load appointments. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [email, searchTerm, statusFilter]);

    const handleAction = async (appointmentId, action) => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/appoint/${appointmentId}`, {
                action,
                advisor_email: email
            });

            setAppointments(appointments.map(appt => 
                appt._id === appointmentId ? { ...appt, status: action.toLowerCase() } : appt
            ));
        } catch (err) {
            setError("Failed to perform action. Please try again.");
            console.error(err);
        }
    };

    const handleVenueChange = async (appointmentId, newVenue) => {
        try {
            await axios.patch(`http://127.0.0.1:5000/api/appoint/${appointmentId}`, {
                venue: newVenue
            });

            setAppointments(appointments.map(appt =>
                appt._id === appointmentId ? { ...appt, venue: newVenue } : appt
            ));
        } catch (err) {
            setError("Failed to update venue. Please try again.");
            console.error(err);
        }
    };

    const formatDateTime = (dateString, timeString) => {
        try {
            const date = parseISO(dateString);
            return `${format(date, "PP")} • ${timeString}`;
        } catch {
            return "Invalid date";
        }
    };

    return (
        <div className="appointment-lister">
            <div className="controls-header">
                <h2>Scheduled Appointments</h2>
                <div className="controls">
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-indicator">Loading appointments...</div>
            ) : appointments.length === 0 ? (
                <div className="empty-state">No appointments found matching your criteria</div>
            ) : (
                <div className="table-container">
                    <table className="appointment-table">
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
                            {appointments.map((appointment) => (
                                <tr key={appointment._id} className={`status-${appointment.status}`}>
                                    <td>
                                        <div className="datetime-cell">
                                            {formatDateTime(appointment.date, appointment.BookedTime)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="student-info">
                                            <div className="student-name">{appointment.student_name}</div>
                                            <div className="student-email">{appointment.student_email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="details-cell">
                                            <span className="department">{appointment.department}</span>
                                            <span className="year">Year {appointment.year}</span>
                                            <span className="module">{appointment.module}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            value={appointment.venue || ""}
                                            onChange={(e) => handleVenueChange(appointment._id, e.target.value)}
                                            className="venue-select"
                                            disabled={appointment.status === "completed"}
                                        >
                                            <option value="">Select venue</option>
                                            {venues.map((venue) => (
                                                <option key={venue} value={venue}>
                                                    {venue}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${appointment.status}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {appointment.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(appointment._id, "CONFIRM")}
                                                        className="confirm-btn"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(appointment._id, "CANCEL")}
                                                        className="cancel-btn"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {appointment.status === "confirmed" && (
                                                <button
                                                    onClick={() => handleAction(appointment._id, "COMPLETE")}
                                                    className="complete-btn"
                                                >
                                                    Mark Complete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AppointmentLister;