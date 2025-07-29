import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom'; // Import Link
import { FiCheck, FiX, FiArrowLeft } from 'react-icons/fi'; // Import FiArrowLeft
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const QuizResultPage = () => {
    const { attemptId } = useParams();
    const { token } = useContext(AuthContext);
    const [attempt, setAttempt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // ... (useEffect hook remains the same) ...
        const fetchAttempt = async () => {
            try {
                const response = await api.get(`/quizzes/my-attempts/${attemptId}`, {
                    headers: { Authorization: token }
                });
                setAttempt(response.data.data);
            } catch (error) {
                console.error("Failed to fetch quiz result", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId, token]);

    if (isLoading) return <div className="p-8">Loading Results...</div>;
    if (!attempt) return <div className="p-8">Could not load quiz results.</div>;

    return (
        <div>
            {/* Back Button */}
            <Link
                to="/student/quizzes"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
            >
                <FiArrowLeft />
                Back to Quizzes List
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold">{attempt.quiz.title} - Results</h2>
                <p className="text-3xl font-bold mt-2 text-green-600">
                    Your Score: {attempt.score} / {attempt.answers.length}
                </p>
            </div>

            <div className="space-y-4">
                {attempt.answers.map((answer, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: answer.isCorrect ? '#10B981' : '#EF4444' }}>
                        <p className="font-semibold text-gray-800 mb-2">{index + 1}. {answer.questionText}</p>
                        <p className={`text-sm p-2 rounded ${answer.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            Your answer: <span className="font-medium">{answer.selectedAnswer}</span>
                        </p>
                        {!answer.isCorrect && (
                             <p className="text-sm mt-2 p-2 rounded bg-gray-50 text-gray-700">
                                Correct answer: <span className="font-medium">{answer.correctAnswer}</span>
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizResultPage;