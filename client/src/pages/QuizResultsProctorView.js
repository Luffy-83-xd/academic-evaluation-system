import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiEye } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const QuizResultsProctorView = () => {
    const { quizId } = useParams();
    const { token } = useContext(AuthContext);
    const [attempts, setAttempts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const response = await api.get(`/quizzes/results/${quizId}`, {
                    headers: { Authorization: token }
                });
                setAttempts(response.data.data);
            } catch (error) {
                console.error("Failed to fetch quiz results", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttempts();
    }, [quizId, token]);

    if (isLoading) return <div className="p-8">Loading Results...</div>;

    return (
        <div>
            <Link
                to="/proctor/quizzes"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
            >
                <FiArrowLeft />
                Back to Quizzes
            </Link>
            <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
            <div className="bg-white shadow overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Details</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attempts.length > 0 ? attempts.map((attempt) => (
                            <tr key={attempt._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.student?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.student?.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{attempt.score} / {attempt.answers.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(attempt.submittedAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/proctor/quiz/attempt/${attempt._id}`} className="text-indigo-600 hover:text-indigo-900">
                                        <FiEye />
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No students have attempted this quiz yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuizResultsProctorView;