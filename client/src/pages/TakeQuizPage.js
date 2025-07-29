import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const TakeQuizPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null); // State for the timer
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // useRef to hold the latest handleSubmit function to avoid stale state in timeout
    const handleSubmitRef = useRef();

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.post(`/quizzes/submit/${quizId}`, { answers }, {
                headers: { Authorization: token }
            });
            toast.success(`Quiz Submitted! Your score is ${response.data.data.score}/${quiz.questions.length}`);
            navigate('/student/quizzes');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit quiz.');
        } finally {
            setIsLoading(false);
        }
    }, [answers, quizId, token, navigate, quiz]);

    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    }, [handleSubmit]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await api.get(`/quizzes/${quizId}`, { headers: { Authorization: token } });
                setQuiz(response.data.data);
                setAnswers(new Array(response.data.data.questions.length).fill(''));
                setTimeLeft(response.data.data.duration * 60); // Initialize timer in seconds
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load the quiz.');
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, token]);

    // Timer countdown effect
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    // Auto-submit effect when timer runs out
    useEffect(() => {
        if (timeLeft === 0) {
            toast.info("Time's up! Submitting your quiz now.");
            handleSubmitRef.current();
        }
    }, [timeLeft]);

    const handleOptionSelect = (option) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = option;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };
    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    
    // Format time for display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) return <div className="p-8">Loading Quiz...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!quiz) return <div className="p-8">Quiz not found.</div>;

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                        <p className="text-gray-600 mb-6">{quiz.subject}</p>
                    </div>
                    {timeLeft !== null && (
                         <div className={`text-2xl font-bold p-3 rounded-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
                <div className="mb-6"><p className="text-sm font-semibold text-gray-700">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p><h2 className="text-xl mt-2">{currentQuestion.questionText}</h2></div>
                <div className="space-y-3 mb-8">{currentQuestion.options.map((option, index) => (<label key={index} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${answers[currentQuestionIndex] === option ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}><input type="radio" name={`question-${currentQuestionIndex}`} value={option} checked={answers[currentQuestionIndex] === option} onChange={() => handleOptionSelect(option)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-800">{option}</span></label>))}</div>
                <div className="flex justify-between items-center"><button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="px-6 py-2 border rounded-lg disabled:opacity-50">Previous</button>{currentQuestionIndex === quiz.questions.length - 1 ? (<button onClick={handleSubmit} disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400">Submit Quiz</button>) : (<button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next</button>)}</div>
            </div>
        </div>
    );
};

export default TakeQuizPage;