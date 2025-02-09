import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import './Home.css';

const Home = () => {
    const name = localStorage.getItem('name');
    const studentNo = localStorage.getItem('studentNo');
    const navigate = useNavigate();
    const [summary, setSummary] = useState({});
    const [studentDepartment, setStudentDepartment] = useState('');
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        const rawSummary = localStorage.getItem('summary');
        if (rawSummary) {
            try {
                const parsedSummary = JSON.parse(rawSummary);
                setSummary(parsedSummary);
                setStudentDepartment(parsedSummary.department || '');
            } catch (error) {
                console.error("Error parsing summary from localStorage:", error);
            }
        }
    }, []);
    console.log(summary);
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
            // Ensure there is an ID before making the request
            if (!summary.id) {
                throw new Error("Summary ID missing. Unable to save.");
            }

            const response = await fetch(`https://api.example.com/surveysave/${summary.id}`, {
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

    return (
        <div>
            <div className="welcome-container">
                <h1>Welcome, {name}!</h1>
                <h1>{studentNo}</h1>
                <p>You are successfully logged in to the Student Success Hub.</p>
            </div>
            <div className="quest">
                <h3>Your department: </h3>
            </div>

            <div className="tabs-container">
                {studentDepartment && departmentIcons[studentDepartment] && (
                    <div className="tab" onClick={() => handleTabClick(studentDepartment)}>
                        <FontAwesomeIcon icon={departmentIcons[studentDepartment]} className="tab-icon" />
                        <h3>{studentDepartment}</h3>
                    </div>
                )}
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
