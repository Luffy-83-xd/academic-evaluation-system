import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiLogIn, FiBarChart2, FiMessageSquare, FiShield, FiZap, FiEye, FiEyeOff } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

const features = [
    {
        icon: <FiZap size={28} />,
        title: "Smart Learning",
        description: "Interactive quizzes and assessments designed to enhance your learning experience."
    },
    {
        icon: <FiBarChart2 size={28} />,
        title: "Performance Analytics",
        description: "Comprehensive analytics and reports to track your progress and identify strengths."
    },
    {
        icon: <FiMessageSquare size={28} />,
        title: "Real-time Communication",
        description: "Connect with proctors and peers through our integrated messaging system."
    },
    {
        icon: <FiShield size={28} />,
        title: "Secure Platform",
        description: "Advanced security measures ensure your data and academic records are protected."
    }
];

const LoginPage = () => {
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setLoading(true);
        setError('');
        const response = await login(email, password, role);
        if (!response.success) {
            setError(response.message);
        }
        setLoading(false);
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-bold text-white">
                        Academic Evaluation &amp; Monitoring System
                    </h1>
                    <p className="text-gray-200 text-lg mt-2">
                        Empowering Education Through Smart Assessment
                    </p>
                </motion.div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200 mb-12"
                >
                    <div className="flex bg-gray-800 bg-opacity-50 rounded-full p-1 mb-6">
                        <button
                            onClick={() => setRole('student')}
                            className={`w-1/2 p-2 rounded-full transition-colors duration-300 ${role === 'student' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                        >
                            Student Login
                        </button>
                        <button
                            onClick={() => setRole('proctor')}
                            className={`w-1/2 p-2 rounded-full transition-colors duration-300 ${role === 'proctor' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                        >
                            Proctor Login
                        </button>
                    </div>

                    <h2 className="text-2xl font-semibold text-white text-center mb-6">{role === 'student' ? 'Student' : 'Proctor'} Portal</h2>

                    <form onSubmit={handleLogin}>
                        <motion.div whileHover={{ scale: 1.02 }} className="relative mb-6">
                            <FiUser className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-300" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-700 bg-opacity-50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent"
                                required
                            />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="relative mb-6">
                            <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-300" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-gray-700 bg-opacity-50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent"
                                required
                            />
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FiEyeOff className="text-gray-300" /> : <FiEye className="text-gray-300" />}
                            </div>
                        </motion.div>
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(59, 130, 246)" }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-500"
                        >
                            <FiLogIn />
                            {loading ? 'Logging in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Feature Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl shadow-lg text-center text-white border border-gray-200 flex flex-col items-center"
                        >
                            <div className="mb-4 text-blue-400">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-300 text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;