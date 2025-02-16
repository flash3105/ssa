import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Survey.css";
import {  useNavigate } from "react-router-dom";

const Survey = () => {
    const navigate = useNavigate();
  const [student, setStudent] = useState({ name: "", studentNumber: "", department: "" });
  const [formData, setFormData] = useState({
    studentNumber:localStorage.getItem("studentNo"),
    department : localStorage.getItem("department"),
    courseChallenges: "",
    needsTutor: false,
    needsStudyBuddy: false,
    overwhelmed: "",
    emotionalState: "",
    needsMentor: false,
    needsCounselor: false,
    careerSupport: false,
    internshipInterest: false,
    financialSupport: false,
    financialAidHelp: false,
    peerNetwork: false,
    departmentGroup: false,
    studentAmbassador: false,
    preferredCommunication: "",
  });
  const [courses, setCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [strugglingWithCourse, setStrugglingWithCourse] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("name");
    const studentNumber = localStorage.getItem("studentNo");
    const department = localStorage.getItem("department");

    if (name && studentNumber && department) {
      setStudent({ name, studentNumber, department });
    }

    axios.get("./courses.json").then((response) => {
      if (department && response.data.EBE_Courses[department]) {
        const updatedCourses = response.data.EBE_Courses[department];
        setCourses(updatedCourses);
        console.log("Courses updated:", updatedCourses);
      }
    });
  }, []);

  // Log the courses when the state is updated
  useEffect(() => {
    console.log("Courses updated:", courses);
  }, [courses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure you're on the last step before submitting
    if (currentStep === 7 && (!formData.courseChallenges || !formData.emotionalState)) {
      alert("Please fill in all the required fields.");
      return;
     
    }

    const surveyData = { ...student, ...formData };

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/saveSurvey", surveyData);
      if (response.status === 200) {
        
        setFormData({
            studentNumber:localStorage.getItem("studentNo"),
          courseChallenges: "",
          needsTutor: false,
          needsStudyBuddy: false,
          overwhelmed: "",
          emotionalState: "",
          needsMentor: false,
          needsCounselor: false,
          careerSupport: false,
          internshipInterest: false,
          financialSupport: false,
          financialAidHelp: false,
          peerNetwork: false,
          departmentGroup: false,
          studentAmbassador: false,
          preferredCommunication: "",
        });
        setTimeout(() => navigate('/'), 2000); // Redirect to login after 2 seconds
      } else {
        alert("Failed to submit survey.");
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("An error occurred while submitting the survey.");
    }
  };

 

  const handlePrevious = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  return (
    <div className="survey-container">
      <h2>Student Support Survey</h2>
      <p>Name: {student.name}</p>
      <p>Student Number: {student.studentNumber}</p>
      <p>Department: {student.department}</p>
      <form onSubmit={handleSubmit}>
        {/* Step 1: Year of Study */}
        {currentStep === 0 && (
          <div>
            <label>Select Your Year of Study:</label>
            <select value={selectedYear} onChange={handleYearChange}>
              <option value="">Select</option>
              {[1, 2, 3, 4].map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleNext}>Next</button>
          </div>
        )}

        {/* Step 2: Struggling with any course */}
        {currentStep === 1 && (
          <div>
            <label>Are you struggling with any course?</label>
            <input
              type="checkbox"
              name="strugglingWithCourse"
              checked={strugglingWithCourse}
              onChange={() => setStrugglingWithCourse((prev) => !prev)}
            />
            {strugglingWithCourse && (
              <div>
                <label>Which course are you struggling with?</label>
                <select name="courseChallenges" onChange={handleChange} required>
                  <option value="">Select a course</option>
                  {courses &&
                    courses[selectedYear] &&
                    courses[selectedYear].map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <button type="button" onClick={handlePrevious}>Previous</button>
            <button type="button" onClick={handleNext}>Next</button>
          </div>
        )}

        {/* Step 3: Emotional State */}
        {currentStep === 2 && (
          <div>
            <label>How are you feeling emotionally?</label>
            <select name="emotionalState" onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Overwhelmed">Overwhelmed</option>
              <option value="Anxious">Anxious</option>
              <option value="Excited">Excited</option>
              <option value="Neutral">Neutral</option>
              <option value="Other">Other</option>
            </select>
            <button type="button" onClick={handlePrevious}>Previous</button>
            <button type="button" onClick={handleNext}>Next</button>
          </div>
        )}

        {/* Step 4: Support Needs */}
        {currentStep === 3 && (
          <div>
            <label>Do you need a tutor?</label>
            <input type="checkbox" name="needsTutor" onChange={handleChange} />
            <div>
              <label>Do you need a study buddy?</label>
              <input type="checkbox" name="needsStudyBuddy" onChange={handleChange} />
            </div>
            <button type="button" onClick={handlePrevious}>Previous</button>
            <button type="button" onClick={handleNext}>Next</button>
          </div>
        )}
        {currentStep === 4 && (
            <div>
                    <label>Do you need a mentor for academic or career guidance?</label>
                    <input type="checkbox" name="needsMentor" onChange={handleChange} />
                    <label>Would you like career support services?</label>
                    <input type="checkbox" name="careerSupport" onChange={handleChange} />
                    <button type="button" onClick={handlePrevious}>Previous</button>
                    <button type="button" onClick={handleNext}>Next</button>
            </div>
        )}
         {currentStep === 5 && (
            <div>
                  <label>Are you interested in internship opportunities?</label>
                 <input type="checkbox" name="internshipInterest" onChange={handleChange} />
                 <button type="button" onClick={handlePrevious}>Previous</button>
                 <button type="button" onClick={handleNext}>Next</button>

            </div>
        )}
         {currentStep === 6 && (
            <div>
                   <label>Do you need financial support?</label>
                   <input type="checkbox" name="financialSupport" onChange={handleChange} />
                   
                   <label>Would you like help with financial aid applications?</label>
                   <input type="checkbox" name="financialAidHelp" onChange={handleChange} />
                   <button type="button" onClick={handlePrevious}>Previous</button>
                   <button type="button" onClick={handleNext}>Next</button>
            </div>
        )}
         
       
        {/* Submit */}
        {currentStep === 7 && (
          <div>
            <label>Preferred Communication Method:</label>
            <select name="preferredCommunication" onChange={handleChange}>
                <option value="">Select</option>
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
            </select>
            <button type="button" onClick={handlePrevious}>Previous</button>
            <button type="submit">Submit</button>
          </div>
        )}
        
      </form>
    </div>
  );
};

export default Survey;
