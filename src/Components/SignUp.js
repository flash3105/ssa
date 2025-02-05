import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css'; // Add a separate CSS file for styling
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [role, setRole] = useState('Student'); // Default role is Student
    const [department, setDepartment] = useState('Civil Engineering'); // Default department
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:5000/api/register', {
                name: `${name} ${surname}`,
                role,
                department,
                email,
                password,
            });
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000); // Redirect to login after 3 seconds
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
