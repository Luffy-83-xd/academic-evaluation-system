import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const ProctorAttemptDetail = () => {
    const { attemptId } = useParams();
    const { token } = useContext(AuthContext);
    const [attempt, setAttempt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const response = await api.get(`/quizzes/my-attempts/${attemptId}`, { headers: { Authorization: token } });
                setAttempt(response.data.data);
            } catch (error) {
                console.error("Failed to fetch attempt details", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId, token]);

    if (isLoading) return <div className="p-8">Loading Attempt Details...</div>;
    if (!attempt) return <div className="p-8">Could not load attempt details.</div>;

    return (
        <div>
            <Link to={`/proctor/quiz/results/${attempt.quiz._id}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium">
                <FiArrowLeft />
                Back to Results List
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold">{attempt.quiz.title} - Attempt Details</h2>
                <p className="text-3xl font-bold mt-2 text-green-600">
                    Final Score: {attempt.score} / {attempt.answers.length}
                </p>
            </div>

            <div className="space-y-4">
                {attempt.answers.map((answer, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: answer.isCorrect ? '#10B981' : '#EF4444' }}>
                        <p className="font-semibold text-gray-800 mb-2">{index + 1}. {answer.questionText}</p>
                        <p className={`text-sm p-2 rounded ${answer.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            Student's answer: <span className="font-medium">{answer.selectedAnswer}</span>
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

export default ProctorAttemptDetail;