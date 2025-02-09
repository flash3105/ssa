import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AcademicChallenge.css";

const AcademicChallenge = () => {
    const selectedDepartment = localStorage.getItem("selectedDepartment"); // Retrieve department
    const navigate = useNavigate();

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [tutors, setTutors] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [departmentModules, setDepartmentModules] = useState([]);

    // Declare DepTutors and DepAdvisors inside the component
    const DepTutors = {
        "Chemistry for Engineers": [
            { name: "Sihle Nduna", email: "sihle.nduna@example.com" },
            { name: "Jabu Wala", email: "jabu.wala@example.com" },
            { name: "Steve Van Wijk", email: "steve.vanwijk@example.com" },
        ],
        "Introduction to Chemical Engineering": [
            { name: "Jane Doe", email: "jane.doe@example.com" },
            { name: "John Smith", email: "john.smith@example.com" },
        ],
    };

    const DepAdvisors = {
        "Chemical Engineering": [
            { name: "Prof. Adams", email: "prof.adams@example.com" },
            { name: "Dr. Sarah", email: "dr.sarah@example.com" },
        ],
        "Electrical Engineering": [
            { name: "Prof. Lee", email: "prof.lee@example.com" },
            { name: "Dr. Johnson", email: "dr.johnson@example.com" },
        ],
    };

    useEffect(() => {
        // Fetch courses.json from the public folder
        fetch("/courses.json")
            .then((response) => response.json())
            .then((data) => {
                const departmentCourses = data.EBE_Courses[selectedDepartment];
                if (departmentCourses) {
                    setDepartmentModules(departmentCourses);
                }
            })
            .catch((error) => console.error("Error fetching courses.json:", error));
    }, [selectedDepartment]);

    const handleYearClick = (year) => {
        setSelectedYear(year);
        localStorage.setItem("selectedYear", year);
        setSelectedModule(null); // Reset module selection
    };

    const handleModuleClick = async (module) => {
        setSelectedModule(module);
        setTutors(DepTutors[module] || []);
        setAdvisors(DepAdvisors[selectedDepartment] || []);
        localStorage.setItem("selectedModule", module);
    };

    const handleBookingClick = (name, email, type) => {
        console.log(`Booking appointment with ${type}: ${name}`);
        localStorage.setItem("AdminName", name);
        localStorage.setItem("selectedTutorOrAdvisor", email);
        navigate("/bookings");
    };

    return (
        <div className="academic-challenge-container">
            <h1 className="title">Academic Challenges in {selectedDepartment}</h1>
            <p className="description">
                Select your year of study and the module you are facing challenges with. We'll guide you with tailored resources.
            </p>

            {/* Render year of study options */}
            {!selectedYear && (
                <div className="section">
                    <h2>Select Your Year of Study</h2>
                    <div className="year-options">
                        {[1, 2, 3, 4].map((year) => (
                            <button
                                key={year}
                                onClick={() => handleYearClick(year)}
                                className="button year-button"
                            >
                                Year {year}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Render module options */}
            {selectedYear && !selectedModule && (
                <div className="section">
                    <h2>Year {selectedYear}: Select a Module</h2>
                    <div className="module-options">
                        {departmentModules[selectedYear]?.map((module) => (
                            <button
                                key={module}
                                onClick={() => handleModuleClick(module)}
                                className="button module-button"
                            >
                                {module}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Render tutors and advisors */}
            {selectedModule && (
                <div className="section">
                    <h2>Selected Module: {selectedModule}</h2>
                    <div className="list-section">
                        <h3>Tutors</h3>
                        {tutors.length > 0 ? (
                            tutors.map(({ name, email }) => (
                                <button
                                    key={name}
                                    className="button list-button"
                                    onClick={() => handleBookingClick(name, email, "Tutor")}
                                >
                                    {name}
                                </button>
                            ))
                        ) : (
                            <p>No tutors available for this module.</p>
                        )}
                    </div>
                    <div className="list-section">
                        <h3>Academic Advisors</h3>
                        {advisors.length > 0 ? (
                            advisors.map(({ name, email }) => (
                                <button
                                    key={name}
                                    className="button list-button"
                                    onClick={() => handleBookingClick(name, email, "Advisor")}
                                >
                                    {name}
                                </button>
                            ))
                        ) : (
                            <p>No academic advisors available for this department.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicChallenge;
