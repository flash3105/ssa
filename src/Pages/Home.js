import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // FontAwesome icons
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
    faUserCircle, // Add this import for the profile icon
} from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
    const name = localStorage.getItem('name'); // Retrieve the user's name from localStorage
    const studentNo = localStorage.getItem('studentNo');
    const navigate = useNavigate(); // Hook for navigation
    const [summary, setSummary] = useState({});
    const [studentDepartment, setStudentDepartment] = useState('');
    const [isProfileVisible, setIsProfileVisible] = useState(false);

    // Fetch and set summary from localStorage
    useEffect(() => {
        const rawSummary = localStorage.getItem('summary');
        
        if (rawSummary) {
            try {
                // Parse the summary from localStorage
                const parsedSummary = JSON.parse(rawSummary);
                setSummary(parsedSummary);
                console.log(parsedSummary);
                // Set the student's department from the summary data
                setStudentDepartment(parsedSummary.department || '');
            } catch (error) {
                console.error("Error parsing summary from localStorage:", error);
                setSummary(null);
            }
        }
    }, []);

    // Function to handle tab click
    const handleTabClick = (department) => {
        // Log the department to local storage or backend
        localStorage.setItem('selectedDepartment', department);

        // Navigate to the "Problems" page
        navigate('/problems');
    };

    // Function to handle profile icon click (show summary info)
    const handleProfileClick = () => {
        setIsProfileVisible(!isProfileVisible);
    };

    return (
        <div>
            <div className="welcome-container">
                <h1>Welcome, {name}!</h1>
                <h1>{studentNo}</h1>
                <p>You are successfully logged in to the Student Success Hub.</p>
            </div>
            <div className="quest">
                <h3>Choose your Major: </h3>
            </div>

            <div className="tabs-container">
                {/* Display only the tab of the student's department */}
                {studentDepartment && (
                    <div className="tab" onClick={() => handleTabClick(studentDepartment)}>
                        <FontAwesomeIcon icon={faIndustry} className="tab-icon" />
                        <h3>{studentDepartment}</h3>
                    </div>
                )}

                <div className="tab" onClick={() => handleTabClick('Chemical Engineering')}>
                    <FontAwesomeIcon icon={faIndustry} className="tab-icon" />
                    <h3>Chemical Engineering</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Electrical Engineering')}>
                    <FontAwesomeIcon icon={faBolt} className="tab-icon" />
                    <h3>Electrical Engineering</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Mechanical Engineering')}>
                    <FontAwesomeIcon icon={faWrench} className="tab-icon" />
                    <h3>Mechanical Engineering</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Civil Engineering')}>
                    <FontAwesomeIcon icon={faBuilding} className="tab-icon" />
                    <h3>Civil Engineering</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Architectural Studies')}>
                    <FontAwesomeIcon icon={faDraftingCompass} className="tab-icon" />
                    <h3>Architectural Studies</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Geomatics')}>
                    <FontAwesomeIcon icon={faGlobe} className="tab-icon" />
                    <h3>Geomatics</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Construction')}>
                    <FontAwesomeIcon icon={faHammer} className="tab-icon" />
                    <h3>Construction</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Environmental')}>
                    <FontAwesomeIcon icon={faLeaf} className="tab-icon" />
                    <h3>Environmental</h3>
                </div>

                <div className="tab" onClick={() => handleTabClick('Urban')}>
                    <FontAwesomeIcon icon={faCity} className="tab-icon" />
                    <h3>Urban</h3>
                </div>
            </div>

            {/* Profile icon section */}
            <div className="profile-container">
                <button className="profile-button" onClick={handleProfileClick}>
                    <FontAwesomeIcon icon={faUserCircle} className="profile-icon" />
                </button>
            </div>

            {/* Sliding form for profile info */}
            {isProfileVisible && (
                <div className={`profile-info-form ${isProfileVisible ? 'show' : ''}`}>
                    <h2>Profile Information</h2>
                    <p><strong>Department:</strong> {summary.department}</p>
                    <p><strong>Student No:</strong> {summary.studentNo}</p>
                    <p><strong>Career Support:</strong> {summary.careerSupport ? "Yes" : "No"}</p>
                    <p><strong>Course Challenges:</strong> {summary.courseChallenges}</p>
                    {/* Display other fields as necessary */}
                </div>
            )}
        </div>
    );
};

export default Home;
