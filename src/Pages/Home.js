import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import {
    faIndustry,
    faBolt,
    faWrench,
    faBuilding,
    faDraftingCompass,
    faGlobe,
    faHammer,
    faLeaf,
    faCity,
    faUserCircle,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Card, Table, Button, Collapse } from 'antd';
import './Home.css';
import AnalogClock from '../Components/AnalogClock';
import FeedbackForm from '../Components/Feedback';
const Home = () => {
    const name = localStorage.getItem('name');
    const studentNo = localStorage.getItem('studentNo');
    const email = localStorage.getItem('email');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({});
    const [studentDepartment, setStudentDepartment] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentDate, setCurrentDate] = useState(''); // Added state for current date and time
    const departmentIcons = {
        'Chemical Engineering': faIndustry,
        'Electrical Engineering': faBolt,
        'Mechanical Engineering': faWrench,
        'Civil Engineering': faBuilding,
        'Architectural Studies': faDraftingCompass,
        'Geomatics': faGlobe,
        'Construction': faHammer,
        'Environmental': faLeaf,
        'Urban': faCity,
    };

    const { Panel } = Collapse;
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false); // State for feedback visibility
    const [feedbackData, setFeedbackData] = useState({});

    useEffect(() => {
        const rawSummary = localStorage.getItem('summary');
        if (rawSummary) {
            try {
                const parsedSummary = JSON.parse(rawSummary);
                if (typeof parsedSummary === 'object') {  // Check if it's an object
                    setSummary(parsedSummary);  // Directly set it as an object
                    setStudentDepartment(parsedSummary.department || '');
                } else {
                    console.error("Parsed data is not an object:", parsedSummary);
                }
            } catch (error) {
                console.error("Error parsing summary from localStorage:", error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!email) return;

            try {
                setLoading(true); 

                const { data } = await axios.get('http://127.0.0.1:5000/api/student/logs', {
                    params: { email: email}
                });
                console.log(data);

                const unconfirmedLogs = data.filter(log => !log.confirmed);
                const confirmedAppointments = data.filter(log => log.confirmed);

                setHistoryLogs(unconfirmedLogs); 
                setAppointments(confirmedAppointments); 
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false); 
            }
        };

        fetchData();
    }, [email]);

    // Set current date and time
    useEffect(() => {
        const intervalId = setInterval(() => {
            const current = new Date();
            const formattedDate = current.toLocaleString('en-US', {
                weekday: 'short', // Mon
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
                month: 'short', // Feb
                day: 'numeric', // 14
            });
            setCurrentDate(formattedDate);
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);
     // Check if the appointment's date has passed and trigger the feedback form
     useEffect(() => {
        const currentDate = new Date();
    
        appointments.forEach((appointment) => {
            const appointmentDate = new Date(appointment.date);
            const daysRemaining = Math.ceil((appointmentDate - currentDate) / (1000 * 60 * 60 * 24));
    
            // Check if the appointment is completed and the days remaining is less than or equal to zero
            if (daysRemaining <= 0 && appointment.status === 'Completed') {
                // If the appointment has passed and the status is "Completed", trigger the feedback form
                setIsFeedbackVisible(true);
                setFeedbackData({
                    studentNumber: studentNo,
                    advisorEmail: appointment.advisor_email,
                    module : appointment.module,
                });
            }
        });
    }, [appointments]);


    const handleFeedbackClose = () => {
        setIsFeedbackVisible(false); // Close feedback form
    };

    const handleTabClick = (department) => {
        localStorage.setItem('selectedDepartment', department);
        navigate('/problems');
    };

    const handleProfileClick = () => {
        setIsProfileVisible(!isProfileVisible);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSummary((prevSummary) => ({
            ...prevSummary,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError(null);

        try {
            if (!summary.id) {
                throw new Error("Summary ID missing. Unable to save.");
            }

            const response = await fetch(`http://127.0.0.1:5000/surveysave/${summary.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(summary),
            });

            if (!response.ok) {
                throw new Error(`Failed to save: ${response.statusText}`);
            }

            const data = await response.json();
            localStorage.setItem('summary', JSON.stringify(summary)); 
            alert("Profile updated successfully!");

        } catch (err) {
            console.error("Error saving profile:", err);
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const appointmentColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => {
                const currentDate = new Date();
                const targetDate = new Date(date);
                const difference = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));
                return `${date} (${difference} days remaining)`;
            }
        },
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
        },
        {
            title: 'Booked Time',
            dataIndex: 'BookedTime',
            key: 'BookedTime',
        },
        {
            title: 'Student Name',
            dataIndex: 'student_name',
            key: 'student_name',
        },
        {
            title: 'Advisor Email',
            dataIndex: 'advisor_email',
            key: 'advisor_email',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Collapse>
                    <Panel header="View More Info" key="1">
                        <div>
                            <p><strong>Department:</strong> {record.department}</p>
                            <p><strong>Year:</strong> {record.year}</p>
                            <p><strong>Booking Time:</strong> {record.BookedTime}</p>
                            <p><strong>Confirmed:</strong> {record.confirmed ? 'Yes' : 'No'}</p>
                            <p><strong>Status:</strong> {record.status || 'N/A'}</p>
                            <p><strong>Venue:</strong> {record.venue || 'N/A'}</p>
                            <p><strong>Timestamp:</strong> {new Date(record.timestamp).toLocaleString()}</p>
                        </div>
                    </Panel>
                </Collapse>
            ),
        },
    ];

    const historyColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => {
                const currentDate = new Date();
                const targetDate = new Date(date);
                const difference = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));
                return `${date} (${difference} days remaining)`;
            }
        },
    
    
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
        },
        {
            title: 'Booked Time',
            dataIndex: 'BookedTime',
            key: 'BookedTime',
        },
        {
            title: 'Confirmed',
            dataIndex: 'confirmed',
            key: 'confirmed',
            render: (text) => (text ? 'Yes' : 'No'),  
        },
    ];

    return (
        <div>
            <AnalogClock/>
            <div className="welcome-container">
                <h1>Welcome, {name}!</h1>
                <h1>{studentNo}</h1>
                <p>You are successfully logged in to the Student Success Hub.</p>
            </div>

            

            <div className="quest">
                <h3>Your department: </h3>
            </div>

            {/* Other components */}
            <div className="tabs-container">
                {studentDepartment && departmentIcons[studentDepartment] && (
                    <div className="tab" onClick={() => handleTabClick(studentDepartment)}>
                        <FontAwesomeIcon icon={departmentIcons[studentDepartment]} className="tab-icon" />
                        <h3>{studentDepartment}</h3>
                    </div>
                )}
            </div>

            {/* Appointments Section */}
            <div className="appointments-section">
                <Card title="Appointments" bordered={false}>
                    <Table
                        dataSource={appointments}
                        columns={appointmentColumns}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            </div>
                  {/* Conditionally render the Feedback Form */}
            {isFeedbackVisible && (
                <div className="feedback-form-overlay">
                    <FeedbackForm 
                        studentNumber={feedbackData.studentNumber} 
                        advisorEmail={feedbackData.advisorEmail} 
                        onClose={handleFeedbackClose} 
                    />
                </div>
            )}
            {/* History Logs Section */}
            <div className="history-logs-section">
                <Card title="History Logs" bordered={false}>
                    <Table
                        dataSource={historyLogs}
                        columns={historyColumns}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            </div>

             {/* Profile icon section */}
             <div className="profile-container">
                <button className="profile-button" onClick={handleProfileClick}>
                    <FontAwesomeIcon icon={faUserCircle} className="profile-icon" />
                </button>
            </div>

            {/* Sliding and Scrollable Profile Form */}
            {isProfileVisible && (
                <div className="profile-info-form show">
                    <button className="close-button" onClick={() => setIsProfileVisible(false)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h2>Profile Information</h2>

                    <div className="form-content">
                        <label>Department:</label>
                        <input type="text" name="department" value={summary.department || ''} readOnly />

                        <label>Student No:</label>
                        <input type="text" name="studentNo" value={summary.studentNo || ''} readOnly />

                        <label>Career Support:</label>
                        <input type="checkbox" name="careerSupport" checked={summary.careerSupport || false} onChange={handleInputChange} />

                        <label>Course Challenges:</label>
                        <input type="text" name="courseChallenges" value={summary.courseChallenges || ''} readOnly/>

                        <label>Emotional State:</label>
                        <input type="text" name="emotionalState" value={summary.emotionalState || ''} onChange={handleInputChange} />

                        <label>Financial Aid Help:</label>
                        <input type="checkbox" name="financialAidHelp" checked={summary.financialAidHelp || false} onChange={handleInputChange} />

                        <label>Internship Interest:</label>
                        <input type="checkbox" name="internshipInterest" checked={summary.internshipInterest || false} onChange={handleInputChange} />

                        <label>Needs Tutor:</label>
                        <input type="checkbox" name="needsTutor" checked={summary.needsTutor || false} onChange={handleInputChange} />

                        <label>Preferred Communication:</label>
                        <input type="text" name="preferredCommunication" value={summary.preferredCommunication || ''} onChange={handleInputChange} />
                    </div>

                    {error && <p className="error">{error}</p>}
                    <button className="save-button" onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
