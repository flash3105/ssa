import React from 'react';

const CareerGuidance = () => {
    const selectedDepartment = localStorage.getItem('selectedDepartment'); // Retrieve department
    return (
        <div>
            <h1>CareerGuidance in {selectedDepartment}</h1>
            <p>Here, you can explore solutions and resources for academic challenges.</p>
        </div>
    );
};

export default CareerGuidance;
