import React, { useState } from "react";
import axios from "axios";
import "./Survey.css";
import { useNavigate } from "react-router-dom";

const FinancialAid = () => {
    const API_URL = "https://ssa-fyk5.onrender.com";
    const navigate = useNavigate();
    const selectedDepartment = localStorage.getItem("selectedDepartment"); // Retrieve department
    const studentNo = localStorage.getItem("studentNo"); // Retrieve student number
    const [formData, setFormData] = useState({
        needsFinancialAid: false,
        needsAidGuidance: false,
        needsAidOfficer: false,
    });
    const [currentStep, setCurrentStep] = useState(0);

    const handleChange = (e) => {
        const { name, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : e.target.value,
        }));
    };

    const handleNext = () => {
        if (currentStep < 2) {
            setCurrentStep((prevStep) => prevStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.needsFinancialAid) {
            alert("Please indicate if you need financial aid.");
            return;
        }

        // Add student number to the form data
        const dataToSubmit = {
            ...formData,
            studentNo: studentNo, // Include student number
        };

        try {
            const response = await axios.post(
                `${API_URL}/api/FinancialAid`,
                dataToSubmit // Submit data with student number
            );
            if (response.status === 200) {
                alert("Survey submitted successfully!");
                window.location.href = "https://www.uct.ac.za/students/fees-funding-fees-fees-faq/financial-assistance";
                 navigate('/home');
            } else {
                alert("Failed to submit survey.");
            }
        } catch (error) {
            console.error("Error submitting survey:", error);
            alert("An error occurred while submitting the survey.");
        }
    };

    return (
        <div className="survey-container">
            <h1>Financial Aid in {selectedDepartment}</h1>
            <p>Here, you can explore solutions and resources for academic challenges.</p>
            <form onSubmit={handleSubmit}>
                {/* Step 1: Need Financial Aid */}
                {currentStep === 0 && (
                    <div>
                        <label>Do you need assistance with financial aid or bursaries?</label>
                        <input
                            type="checkbox"
                            name="needsFinancialAid"
                            checked={formData.needsFinancialAid}
                            onChange={handleChange}
                        />
                        <button type="button" onClick={handleNext}>Next</button>
                    </div>
                )}

                {/* Step 2: Guidance Options */}
                {currentStep === 1 && (
                    <div>
                        <label>Would you like guidance on:</label>
                        
                        <input
                            type="checkbox"
                            name="needsAidGuidance"
                            checked={formData.needsAidGuidance}
                            onChange={handleChange}
                        /> Applying for financial aid?
                     
                        <input
                            type="checkbox"
                            name="needsAidOfficer"
                            checked={formData.needsAidOfficer}
                            onChange={handleChange}
                        /> Meeting a financial aid officer?
                       
                        <button type="button" onClick={handlePrevious}>Previous</button>
                        <button type="button" onClick={handleNext}>Next</button>
                    </div>
                )}

                {/* Step 3: Submit */}
                {currentStep === 2 && (
                    <div>
                        <button type="button" onClick={handlePrevious}>Previous</button>
                        <button type="submit">Submit</button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default FinancialAid;
