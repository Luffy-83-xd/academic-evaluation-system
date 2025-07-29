import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const ProctorAnalytics = () => {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStudents = useCallback(async (currentPage) => {
        try {
            const response = await api.get(`/users/students?page=${currentPage}`, {
                headers: { Authorization: token },
            });
            setStudents(response.data.data);
            setPage(response.data.page);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error("Failed to fetch students", error);
        }
    }, [token]);

    useEffect(() => {
        fetchStudents(page);
    }, [page, fetchStudents]);

    // Filter students based on search
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
           <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Student Analytics</h2>
                <div className="relative">
                    <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"/>
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                        <li key={student._id}>
                            <Link to={`/proctor/analytics/${student._id}`} className="block hover:bg-gray-50"><div className="px-4 py-4 sm:px-6"><div className="flex items-center justify-between"><p className="text-sm font-medium text-indigo-600 truncate">{student.name}</p></div><div className="mt-2 sm:flex sm:justify-between"><div className="sm:flex"><p className="flex items-center text-sm text-gray-500">{student.email}</p></div></div></div></Link>
                        </li>
                    ))}
                </ul>
            </div>
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-l-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <span className="px-4 py-2 text-sm text-gray-700 bg-white border-t border-b border-gray-300">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-r-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

export default ProctorAnalytics;