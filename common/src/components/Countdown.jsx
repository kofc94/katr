import React, { useState, useEffect } from 'react';

export default function Countdown({ targetDate, title = 'Race Night Countdown' }) {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    if (!targetDate) return;
    const eventTime = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = eventTime - now;

      if (distance < 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  return (
    <div className="countdown-box">
      <div className="countdown-title">{title}</div>
      <div className="timer-grid">
        <div className="timer-item">
          <span className="timer-val">{timeLeft.days}</span>
          <span className="timer-unit">Days</span>
        </div>
        <div className="timer-item">
          <span className="timer-val">{timeLeft.hours}</span>
          <span className="timer-unit">Hours</span>
        </div>
        <div className="timer-item">
          <span className="timer-val">{timeLeft.minutes}</span>
          <span className="timer-unit">Minutes</span>
        </div>
        <div className="timer-item">
          <span className="timer-val">{timeLeft.seconds}</span>
          <span className="timer-unit">Seconds</span>
        </div>
      </div>
    </div>
  );
}
