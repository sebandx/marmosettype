import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { WORDS } from './words';
import './App.css';

const NUM_OF_WORDS = 50;

const calculateWpm = (chars, timeInSeconds) => {
    if (timeInSeconds === 0) return 0;
    const minutes = timeInSeconds / 60;
    const words = chars / 5;
    return Math.round(words / minutes);
};

function TypingTest() {
    const [words, setWords] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [activeWordIndex, setActiveWordIndex] = useState(0);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [isTestFinished, setIsTestFinished] = useState(false);
    const [timer, setTimer] = useState(0);
    const [finalWpm, setFinalWpm] = useState(0);
    const [wpmData, setWpmData] = useState([]);

    const inputRef = useRef(null);
    const correctCharsRef = useRef(0);

    const generateWords = () => {
        return Array.from({ length: NUM_OF_WORDS }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
    };

    const resetTest = () => {
        setWords(generateWords());
        setUserInput('');
        setActiveWordIndex(0);
        setIsTestStarted(false);
        setIsTestFinished(false);
        setTimer(0);
        correctCharsRef.current = 0;
        setWpmData([]);
        setFinalWpm(0);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    useEffect(() => {
        resetTest();
    }, []);

    useEffect(() => {
        let interval;
        if (isTestStarted && !isTestFinished) {
            interval = setInterval(() => {
                setTimer(prevTimer => {
                    const newTime = prevTimer + 1;
                    const currentWpm = calculateWpm(correctCharsRef.current, newTime);
                    setWpmData(prevData => [...prevData, { time: newTime, wpm: currentWpm }]);
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTestStarted, isTestFinished]);

    const handleInputChange = (e) => {
        const value = e.target.value;

        if (isTestFinished) return;
        if (!isTestStarted) {
            setIsTestStarted(true);
        }

        if (value.endsWith(' ')) {
            const typedWord = userInput.trim();
            const currentWord = words[activeWordIndex];

            if (typedWord === currentWord) {
                correctCharsRef.current += currentWord.length + 1;
            }

            if (activeWordIndex === words.length - 1) {
                setIsTestFinished(true);
                setIsTestStarted(false);
                setFinalWpm(calculateWpm(correctCharsRef.current, timer));
                setUserInput('');
                return;
            }

            setActiveWordIndex(activeWordIndex + 1);
            setUserInput('');
        } else {
            setUserInput(value);
        }
    };

    // The main container now just holds the title and the conditional content
    return (
        <div className="typing-test-container">
            <h1 className="main-title">Marmoset Type</h1>
            
            {!isTestFinished ? (
                // This is the active test view, now without the extra div or timer
                <>
                    <div className="word-container" onClick={() => inputRef.current.focus()}>
                        {words.map((word, wordIndex) => (
                            <span key={wordIndex} className={`word ${wordIndex === activeWordIndex ? 'active-word' : ''}`}>
                                {word.split('').map((char, charIndex) => {
                                    let charClass = '';
                                    if (wordIndex === activeWordIndex && charIndex < userInput.length) {
                                        charClass = char === userInput[charIndex] ? 'correct' : 'incorrect';
                                    }
                                    return <span key={charIndex} className={charClass}>{char}</span>;
                                })}
                            </span>
                        ))}
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        className="typing-input"
                        autoFocus 
                    />
                </>
            ) : (
                <div className="results-screen">
                    <h2>Test Completed!</h2>
                    <h3 className="results-score">Your Score: {finalWpm} WPM</h3>
                    <div className="chart-container">
                        <h4>WPM Over Time</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={wpmData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                                <XAxis dataKey="time" unit="s" stroke="#ccc" label={{ value: 'Time', position: 'insideBottom', dy: 15 }} />
                                <YAxis stroke="#ccc" label={{ value: 'WPM', angle: -90, position: 'insideLeft' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
                                <Line type="monotone" dataKey="wpm" stroke="#FFD700" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <button onClick={resetTest} className="reset-button">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}

export default TypingTest;