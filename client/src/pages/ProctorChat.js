import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FiSend, FiRadio, FiSearch } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const ProctorChat = () => {
    const { user, token, socket } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const scrollRef = useRef();
    const [unreadCounts, setUnreadCounts] = useState({});

    const handleBroadcast = () => {
        const message = window.prompt("Enter the message you want to broadcast to all students:");
        if (message && message.trim() !== '') {
            socket.current.emit('broadcastMessage', {
                senderName: user.name,
                content: message,
            });
            toast.success("Broadcast message sent successfully!");
        }
    };

    useEffect(() => {
        const getStudents = async () => {
            try {
                const response = await api.get('/users/students', { headers: { Authorization: token } });
                setStudents(response.data.data);
            } catch (error) {
                console.error("Could not fetch students.", error);
            }
        };
        getStudents();
    }, [token]);

    useEffect(() => {
        if (selectedStudent) {
            const getHistory = async () => {
                try {
                    const response = await api.get(`/chat/history/${selectedStudent._id}`, { headers: { Authorization: token } });
                    setMessages(response.data.data);
                } catch (error) {
                    console.error("Could not fetch chat history.", error);
                }
            };
            getHistory();
            setUnreadCounts(prev => {
                const newCounts = { ...prev };
                delete newCounts[selectedStudent._id];
                return newCounts;
            });
        }
    }, [selectedStudent, token]);

    useEffect(() => {
        if (socket.current) {
            socket.current.on('receiveMessage', (message) => {
                if (selectedStudent?._id === message.sender) {
                    setMessages(prev => [...prev, message]);
                } else {
                    // If chat is not open, update unread count
                    setUnreadCounts(prev => ({
                        ...prev,
                        [message.sender]: (prev[message.sender] || 0) + 1
                    }));
                }
            });
        }
        return () => socket.current?.off('receiveMessage');
    }, [socket, selectedStudent]);
    
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedStudent) return;
        socket.current.emit('sendMessage', {
            senderId: user.id,
            receiverId: selectedStudent._id,
            content: newMessage,
        });
        setNewMessage('');
    };

    // Filter students based on search
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-md">
            {/* Left Panel: Student List */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Conversations</h2>
                        <button 
                            onClick={handleBroadcast} 
                            title="Broadcast Message" 
                            className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                        >
                            <FiRadio size={16} /> Broadcast
                        </button>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <ul className="flex-1 overflow-y-auto">
                    {filteredStudents.map(student => (
                        <li key={student._id} onClick={() => setSelectedStudent(student)} className="...">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{student.name}</p>
                                {unreadCounts[student._id] > 0 && (
                                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{student.email}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Panel: Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedStudent ? (
                    <>
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-bold">Chat with {selectedStudent.name}</h2>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {messages.map((msg) => (
                                <div key={msg._id || Date.now()} ref={scrollRef} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`px-4 py-2 rounded-2xl max-w-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 border rounded-lg" />
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><FiSend /> Send</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Select a student to start a conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProctorChat;