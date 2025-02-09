import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Problems.css';

const Problems = () => {
    const selectedDepartment = localStorage.getItem('selectedDepartment'); // Retrieve the selected department
    const navigate = useNavigate();
    const [studentDepartment, setStudentDepartment] = useState('');
    const [summary, setSummary] = useState({});

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

    // Function to handle category selection
    const handleCategoryClick = (category, path) => {
        const log = {
            department: selectedDepartment,
            category: category,
            timestamp: new Date().toISOString(),
        };

        console.log('Log:', log);
        localStorage.setItem('selectedCategory', JSON.stringify(log));
        navigate(path);
    };

    return (
        <div className="problems-container">
            <h1>Suggestions for you</h1>
            <p>Select the category of the problem:</p>

            <div className="categories-container">
                {/* Academic Challenge */}
                {(summary.courseChallenges || summary.needsTutor) && (
                    <div className="category-tab" onClick={() => handleCategoryClick('Academic Challenge', '/academic-challenge')}>
                        <h3>Academic Challenge</h3>
                    </div>
                )}

                {/* Mental Health */}
                {(summary.emotionalState === 'anxious' || summary.emotionalState === 'overwhelmed') && (
                    <div className="category-tab" onClick={() => handleCategoryClick('Mental Health', '/mental-health')}>
                        <h3>Mental Health</h3>
                    </div>
                )}

                {/* Career Guidance */}
                {summary.careerSupport && (
                    <div className="category-tab" onClick={() => handleCategoryClick('Career Guidance', '/career-guidance')}>
                        <h3>Career Guidance</h3>
                    </div>
                )}

                {/* Financial Aid */}
                {(summary.financialAidHelp || summary.financialSupport) && (
                    <div className="category-tab" onClick={() => handleCategoryClick('Financial Aid', '/financial-aid')}>
                        <h3>Financial Aid</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Problems;
