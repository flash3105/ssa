import React, { useState } from "react";
import axios from "axios";
import "./Survey.css";
import { useNavigate } from "react-router-dom";

const MentalHealth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emotionalState: "",
    adjustingConcerns: false,
    needsMentor: false,
    needsCounselor: false,
  });
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    
    if (currentStep === 2 && !formData.emotionalState) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/saveSurvey", formData);
      if (response.status === 200) {
        alert("Survey submitted successfully!");
        navigate("/");
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
      <h2>Personal Well-being Survey</h2>
      <p>Here, you can explore solutions and resources for academic challenges.</p>
      <form onSubmit={handleSubmit}>
        {/* Step 1: Emotional State */}
        {currentStep === 0 && (
          <div>
            <label>How are you feeling emotionally since starting university?</label>
            <select name="emotionalState" onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Overwhelmed">Overwhelmed</option>
              <option value="Anxious">Anxious</option>
              <option value="Excited">Excited</option>
              <option value="Neutral">Neutral</option>
              <option value="Other">Other</option>
            </select>
            <button type="button" onClick={handleNext}>Next</button>
          </div>
        )}

        {/* Step 2: Adjusting to University */}
        {currentStep === 1 && (
          <div>
            <label>Do you have concerns about adjusting to university life?</label>
            <input type="checkbox" name="adjustingConcerns" onChange={handleChange} />
            {formData.adjustingConcerns && (
              <div>
                <label>Would you like to speak to:</label>
                <br />
                <input type="checkbox" name="needsMentor" onChange={handleChange} /> A student mentor?
                <br />
                <input type="checkbox" name="needsCounselor" onChange={handleChange} /> A psychologist or counselor?
              </div>
            )}
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

export default MentalHealth;

