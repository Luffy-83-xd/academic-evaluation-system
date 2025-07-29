import React, { useState, useEffect, useContext, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const StudentChat = () => {
    const { user, token, socket } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [proctor, setProctor] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        // Fetch the student's own profile to find their assigned proctor
        const getAssignedProctor = async () => {
            try {
                const response = await api.get('/users/me', { headers: { Authorization: token }});
                if (response.data.data.assignedProctor) {
                    setProctor(response.data.data.assignedProctor);
                }
            } catch (error) {
                console.error("Could not find assigned proctor.", error);
            }
        };
        getAssignedProctor();
    }, [token]);

    useEffect(() => {
        // Fetch chat history once the proctor is identified
        if (proctor) {
            const getHistory = async () => {
                try {
                    const response = await api.get(`/chat/history/${proctor._id}`, { headers: { Authorization: token }});
                    setMessages(response.data.data);
                } catch (error) {
                    console.error("Could not fetch chat history.", error);
                }
            };
            getHistory();
        }
    }, [proctor, token]);

    useEffect(() => {
        // Listen for incoming messages
        if (socket.current) {
            socket.current.on('receiveMessage', (message) => {
                // Ensure the incoming message is from the assigned proctor
                if (proctor && message.sender === proctor._id) {
                    setMessages(prev => [...prev, message]);
                }
            });
        }
        return () => socket.current?.off('receiveMessage');
    }, [socket, proctor]);

    useEffect(() => {
        // Auto-scroll to the latest message
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !proctor) return;

        socket.current.emit('sendMessage', {
            senderId: user.id,
            receiverId: proctor._id,
            content: newMessage,
        });
        setNewMessage('');
    };

    if (!proctor) {
        return <div className="p-4 text-center text-gray-600">You have not been assigned a proctor yet.</div>;
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-lg shadow-md">
            {/* Chat Header */}
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Chat with {proctor.name}</h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg._id || Date.now()} ref={scrollRef} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                           {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-lg"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                        <FiSend /> Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentChat;