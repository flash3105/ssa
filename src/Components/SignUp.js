import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SignUp.css'; // Add a separate CSS file for styling
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [role, setRole] = useState('Student'); // Default role is Student
    const [department, setDepartment] = useState('Civil Engineering'); // Default department
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [courses, setCourses] = useState([]); // To store the courses from courses.json
    const [selectedCourse, setSelectedCourse] = useState(''); // To store the selected course
    const navigate = useNavigate();

    // Fetch courses from courses.json when the component mounts
    useEffect(() => {
        axios.get('./courses.json')
            .then(response => {
                setCourses(response.data.EBE_Courses); // Assuming response.data is the courses structure
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    }, []);

    // Extract courses based on the selected department
    const getCoursesForDepartment = (department) => {
        return courses[department] ? Object.values(courses[department]).flat() : [];
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const userData = {
                name: `${name} ${surname}`,
                role,
                studentNo,
                department,
                email,
                password,
            };

            // If the user is a Tutor, include the subject
            if (role === 'Tutor') {
                userData.subject = selectedCourse;
            }

            await axios.post('http://127.0.0.1:5000/api/register', userData);

            localStorage.setItem('name', name);
            localStorage.setItem('department', department);
            localStorage.setItem('studentNo', studentNo);
            setSuccess(true);

            setTimeout(() => {
                navigate(role === 'Student' ? '/survey' : '/');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Sign-Up failed');
        }
    };

    return (
        <form onSubmit={handleSignUp}>
            <h1>Create an Account</h1>
            <input
                type="text"
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Enter your surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Enter your Student No. or EMPLID"
                value={studentNo}
                onChange={(e) => setStudentNo(e.target.value)}
                required
            />
            <label>Role</label>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
            >
                <option value="Student">Student</option>
                <option value="Academic Advisor">Academic Advisor</option>
                <option value="Tutor">Tutor</option>
            </select>

            {/* Department dropdown */}
            <label>Department</label>
            <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
            >
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Architectural Studies">Architectural Studies</option>
                <option value="Geomatics">Geomatics</option>
                <option value="Construction">Construction</option>
                <option value="Environmental Engineering">Environmental Engineering</option>
                <option value="Urban Engineering">Urban Engineering</option>
            </select>

            {/* Tutor subject dropdown, only visible if role is "Tutor" */}
            {role === 'Tutor' && (
                <>
                    <label>Course</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                    >
                        <option value="">Select a course</option>
                        {getCoursesForDepartment(department).map((course, index) => (
                            <option key={index} value={course}>
                                {course}
                            </option>
                        ))}
                    </select>
                </>
            )}

            <input
                type="email"
                placeholder="Enter your UCT email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">Registration successful! Redirecting...</p>}
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignUp;
