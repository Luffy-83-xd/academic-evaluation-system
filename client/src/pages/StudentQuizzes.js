import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiHelpCircle, FiCheckSquare } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const StudentQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchQuizData = async () => {
            setIsLoading(true);
            try {
                const [quizzesRes, attemptsRes] = await Promise.all([
                    api.get('/quizzes', { headers: { Authorization: token } }),
                    api.get('/quizzes/my-attempts/all', { headers: { Authorization: token } })
                ]);
                setQuizzes(quizzesRes.data.data);
                setAttempts(attemptsRes.data.data);
            } catch (error) {
                console.error("Failed to fetch quiz data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizData();
    }, [token]);
    
    const { availableQuizzes, attemptedQuizzes } = useMemo(() => {
        const attemptedQuizIds = new Set(attempts.map(a => a.quiz._id));
        return {
            availableQuizzes: quizzes.filter(q => !attemptedQuizIds.has(q._id) && new Date(q.deadline) > new Date()),
            attemptedQuizzes: attempts,
        };
    }, [quizzes, attempts]);

    if (isLoading) {
        return <div>Loading quizzes...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Available Quizzes Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableQuizzes.length > 0 ? availableQuizzes.map(quiz => (
                        <div key={quiz._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                            <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{quiz.subject}</p>
                            <div className="text-sm text-gray-600 space-y-2 mb-4 flex-grow">
                                <p className="flex items-center"><FiHelpCircle className="mr-2" /> {quiz.questions.length} Questions</p>
                                <p className="flex items-center"><FiClock className="mr-2" /> Deadline: {new Date(quiz.deadline).toLocaleString()}</p>
                            </div>
                            <Link to={`/student/quiz/${quiz._id}`} className="mt-auto text-center w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                Take Quiz
                            </Link>
                        </div>
                    )) : <p className="text-gray-500 col-span-full">No new quizzes available right now.</p>}
                </div>
            </div>

            {/* Attempted Quizzes Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Attempted Quizzes</h2>
                <div className="bg-white rounded-lg shadow-md">
                    <ul className="divide-y divide-gray-200">
                        {attemptedQuizzes.length > 0 ? attemptedQuizzes.map(attempt => (
                             <li key={attempt._id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">{attempt.quiz.title}</p>
                                    <p className="text-sm text-gray-500">{attempt.quiz.subject}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-semibold text-lg text-green-600">
                                        Score: {attempt.score} / {attempt.answers.length}
                                    </p>
                                    <Link to={`/student/quiz/result/${attempt._id}`} className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-700">
                                        <FiCheckSquare/> View Result
                                    </Link>
                                </div>
                             </li>
                        )) : <p className="p-4 text-center text-gray-500">You haven't attempted any quizzes yet.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentQuizzes;