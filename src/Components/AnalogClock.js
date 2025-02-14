import React, { useEffect, useState } from 'react';
import './AnalogClock.css'; // Import the clock CSS for styling

const AnalogClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, []);

    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    
    const hourDeg = (hour % 12) * 30 + (minute / 60) * 30; // Hour hand angle
    const minuteDeg = minute * 6 + (second / 60) * 6; // Minute hand angle
    const secondDeg = second * 6; // Second hand angle

    return (
        <div className="clock-container">
            <div className="clock">
                <div
                    className="hand hour-hand"
                    style={{ transform: `rotate(${hourDeg}deg)` }}
                ></div>
                <div
                    className="hand minute-hand"
                    style={{ transform: `rotate(${minuteDeg}deg)` }}
                ></div>
                <div
                    className="hand second-hand"
                    style={{ transform: `rotate(${secondDeg}deg)` }}
                ></div>
                <div className="center-circle"></div>
            </div>
            <div className="date-time">
                <span>{time.toLocaleString('en-US', { weekday: 'short' })}</span>
                <span>{time.toLocaleTimeString()}</span>
                <span>{time.toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default AnalogClock;
