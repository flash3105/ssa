import React from 'react';

const AdministrativeIssues = () => {
    const selectedDepartment = localStorage.getItem('selectedDepartment'); // Retrieve department
    return (
        <div>
            <h1>AdministrativeIssues in {selectedDepartment}</h1>
            <p>Here, you can explore solutions and resources for academic challenges.</p>
        </div>
    );
};

export default AdministrativeIssues;
