import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Row, Col, Button, Card, Typography, Select } from "antd";
import "./AcademicChallenge.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AcademicChallenge = () => {
    const selectedDepartment = localStorage.getItem("selectedDepartment");
    const navigate = useNavigate();

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [tutors, setTutors] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [departmentModules, setDepartmentModules] = useState([]);
    const [resources, setResources] = useState([]);

    useEffect(() => {
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

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/users/adminP")
            .then((response) => {
                const users = response.data;
                const filteredTutors = users.filter(user => user.role === "Tutor" && user.department === selectedDepartment);
                const filteredAdvisors = users.filter(user => user.role === "Academic Advisor" && user.department === selectedDepartment);
                setTutors(filteredTutors);
                setAdvisors(filteredAdvisors);
            })
            .catch(error => console.error("Error fetching tutors and advisors:", error));
    }, [selectedDepartment]);

    const handleYearClick = (year) => {
        setSelectedYear(year);
        localStorage.setItem("selectedYear", year);
        setSelectedModule(null);
    };

    const handleModuleClick = async (module) => {
        setSelectedModule(module);
        localStorage.setItem("selectedModule", module);

        axios.get(`http://127.0.0.1:5000/api/resources/${module}`)
            .then((response) => {
                setResources(response.data.resources || []);
            })
            .catch((error) => console.error("Error fetching resources:", error));

        const moduleTutors = tutors.filter(tutor => tutor.subject === module);
        setTutors(moduleTutors);
    };

    const handleBookingClick = (name, email, type) => {
        console.log(`Booking appointment with ${type}: ${name}`);
        localStorage.setItem("AdminName", name);
        localStorage.setItem("selectedTutorOrAdvisor", email);
        navigate("/bookings");
    };

    return (
        <div className="academic-challenge-container">
            {/* Back Button */}
            <Button type="default" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                ← Back
            </Button>

            <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
                Academic Challenges in {selectedDepartment}
            </Title>

            <Text style={{ display: "block", textAlign: "center", marginBottom: 20 }}>
                Select your year of study and the module you are facing challenges with. We'll guide you with tailored resources.
            </Text>

            {!selectedYear && (
                <Row justify="center" gutter={[16, 16]}>
                    {[1, 2, 3, 4].map((year) => (
                        <Col key={year} xs={24} sm={12} md={6}>
                            <Button type="primary" block onClick={() => handleYearClick(year)}>
                                Year {year}
                            </Button>
                        </Col>
                    ))}
                </Row>
            )}

            {selectedYear && !selectedModule && (
                <div style={{ textAlign: "center", marginTop: 20 }}>
                    <Title level={3}>Year {selectedYear}: Select a Module</Title>
                    <Select
                        style={{ width: "50%" }}
                        placeholder="Select a module"
                        onChange={handleModuleClick}
                    >
                        {departmentModules[selectedYear]?.map((module) => (
                            <Option key={module} value={module}>{module}</Option>
                        ))}
                    </Select>
                </div>
            )}

            {selectedModule && (
                <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                    <Col span={24}>
                        <Title level={3} style={{ textAlign: "center" }}>
                            Selected Module: {selectedModule}
                        </Title>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Tutors" bordered>
                            {tutors.length > 0 ? (
                                tutors.map(({ _id, name, email }) => (
                                    <Button
                                        key={_id}
                                        type="dashed"
                                        block
                                        onClick={() => handleBookingClick(name, email, "Tutor")}
                                        style={{ marginBottom: 10 }}
                                    >
                                        {name}
                                    </Button>
                                ))
                            ) : (
                                <Text>No tutors available for this module.</Text>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Academic Advisors" bordered>
                            {advisors.length > 0 ? (
                                advisors.map(({ _id, name, email }) => (
                                    <Button
                                        key={_id}
                                        type="dashed"
                                        block
                                        onClick={() => handleBookingClick(name, email, "Advisor")}
                                        style={{ marginBottom: 10 }}
                                    >
                                        {name}
                                    </Button>
                                ))
                            ) : (
                                <Text>No academic advisors available for this department.</Text>
                            )}
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card title="Resources" bordered>
                            {resources.length > 0 ? (
                                resources.map((resource) => (
                                    <div key={resource._id} style={{ marginBottom: 20 }}>
                                        <Text strong>{resource.name}</Text>
                                        <p>{resource.description}</p>

                                        {/* Show Preview for PDFs */}
                                        {resource.file_path && resource.file_path.endsWith(".pdf") && (
                                            <iframe
                                                src={`http://127.0.0.1:5000/${resource.file_path}`}
                                                style={{
                                                    width: "100%",
                                                    height: "300px",
                                                    borderRadius: "8px",
                                                    border: "1px solid #ddd",
                                                    marginBottom: "10px",
                                                }}
                                            />
                                        )}

                                        {/* Download Link */}
                                        {resource.file_path && (
                                            <a
                                                href={`http://127.0.0.1:5000/${resource.file_path}`}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: "inline-block",
                                                    padding: "8px 12px",
                                                    backgroundColor: "#007bff",
                                                    color: "#fff",
                                                    borderRadius: "5px",
                                                    textDecoration: "none",
                                                    transition: "background-color 0.3s",
                                                }}
                                                onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
                                                onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
                                            >
                                                📥 Download the file
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No resources available</p>
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default AcademicChallenge;
