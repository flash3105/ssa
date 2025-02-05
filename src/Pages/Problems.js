import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Problems.css';

const Problems = () => {
    const selectedDepartment = localStorage.getItem('selectedDepartment'); // Retrieve the selected department
    const navigate = useNavigate();

    // Function to handle category selection
    const handleCategoryClick = (category, path) => {
        // Log the selected category
        const log = {
            department: selectedDepartment,
            category: category,
            timestamp: new Date().toISOString(),
        };

        console.log('Log:', log); // For debugging or sending to backend
        localStorage.setItem('selectedCategory', JSON.stringify(log));

        // Navigate to the category-specific path
        navigate(path);
    };

    return (
        <div className="problems-container">
            <h1>Problems in {selectedDepartment}</h1>
            <p>Select the category of the problem:</p>

            <div className="categories-container">
                <div
                    className="category-tab"
                    onClick={() => handleCategoryClick('Academic Challenge', '/academic-challenge')}
                >
                    <h3>Academic Challenge</h3>
                </div>
                <div
                    className="category-tab"
                    onClick={() => handleCategoryClick('Mental Health', '/mental-health')}
                >
                    <h3>Mental Health</h3>
                </div>
                <div
                    className="category-tab"
                    onClick={() => handleCategoryClick('Career Guidance', '/career-guidance')}
                >
                    <h3>Career Guidance</h3>
                </div>
                <div
                    className="category-tab"
                    onClick={() => handleCategoryClick('Financial Aid', '/financial-aid')}
                >
                    <h3>Financial Aid</h3>
                </div>
                <div
                    className="category-tab"
                    onClick={() => handleCategoryClick('Administrative Issues', '/administrative-issues')}
                >
                    <h3>Administrative Issues</h3>
                </div>
            </div>
        </div>
    );
};

export default Problems;
