import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = "https://ssa-fyk5.onrender.com";
    //const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/login`, {
                email,
                password,
            });
    
            // Save the token, name, role, and student number
            const { token, name, role, studentNo } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('name', name);
            localStorage.setItem('role', role);
            localStorage.setItem('email', email);
            localStorage.setItem('studentNo', studentNo);
            console.log(studentNo);
            console.log(response.data); 
            // Fetch survey summary separately
            fetchSurveySummary(studentNo, token);
    
            // Navigate based on role
            if (role === 'Student') {
                navigate('/home');
            } else if (role === 'Advisor' || role === 'Tutor') {
                navigate('/AdminPage');
            } else {
                setError('Invalid role');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };
    
 // Function to fetch survey summary after login
const fetchSurveySummary = async (studentNo, token) => {
    try {
        const response = await axios.get(`http://127.0.0.1:5000/api/get_summary/${studentNo}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

       

        // Ensure the summary is stringified before storing in localStorage
        localStorage.setItem('summary', JSON.stringify(response.data.summary));

    } catch (err) {
        console.error("Error fetching survey summary:", err);
        localStorage.setItem('summary', 'No summary available');
    }
};

    

    return (
        <form onSubmit={handleLogin}>
            <h1>Sign in to Student Success Hub</h1>
            <img
                src="images/PHOTO-2024-11-28-10-59-02 (1).jpg"
                alt="Student Success Hub"
                className="login-logo"
            />
            <h2>Email</h2>
            <input
                type="email"
                placeholder="Enter your UCT email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <h2>Password</h2>
            <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit">
                <FontAwesomeIcon icon={faSignInAlt} />
                Login
            </button>
            <br/>
            <button
                type="button"
                className="sign-up-button"
                onClick={() => navigate('/signup')} // Navigate to SignUp component
            >
                Sign Up
            </button>
            <a href="#">Forgot password</a>
        </form>
    );
};

export default Login;
