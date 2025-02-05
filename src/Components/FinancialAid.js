import React from 'react';

const FinancialAid = () => {
    const selectedDepartment = localStorage.getItem('selectedDepartment'); // Retrieve department
    return (
        <div>
            <h1>FinancialAid in {selectedDepartment}</h1>
            <p>Here, you can explore solutions and resources for academic challenges.</p>
        </div>
    );
};

export default FinancialAid;
