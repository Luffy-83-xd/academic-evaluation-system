import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext } from 'react';
import { FiEdit, FiSave, FiCamera } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const ProfilePage = () => {
    const { user, token, updateUserInContext } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/me', { headers: { Authorization: token } });
                setProfile(response.data.data);
                setFormData(response.data.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, [token]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/users/profile', formData, { headers: { Authorization: token } });
            setProfile(response.data.data);
            updateUserInContext(response.data.data);
            setEditMode(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Update failed. Please try again.");
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        const uploadFormData = new FormData();
        uploadFormData.append('avatar', avatarFile);
        try {
            const response = await api.put('/users/avatar', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token
                }
            });
            setProfile(response.data.data);
            updateUserInContext(response.data.data);
            setAvatarFile(null); // Clear file input
        } catch (error) {
            console.error("Avatar upload failed", error);
            toast.error("Avatar upload failed. Please ensure it's an image file.");
        }
    };

    if (!profile) return <div>Loading profile...</div>;

    const renderField = (label, name, value) => (
        <div>
            <label className="block text-sm font-medium text-gray-500">{label}</label>
            {editMode ? (
                <input type="text" name={name} value={formData[name] || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            ) : (
                <p className="text-lg text-gray-800">{value}</p>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <img src={`http://localhost:8080/${profile.avatar}`} alt="Avatar" className="w-40 h-40 rounded-full mx-auto mb-4 object-cover" />
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <p className="text-gray-500 capitalize">{profile.role}</p>
                    <div className="mt-4">
                        <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                           <FiCamera /> Change Picture
                        </label>
                        <input id="avatar-upload" type="file" className="hidden" onChange={(e) => setAvatarFile(e.target.files[0])} />
                        {avatarFile && <button onClick={handleAvatarUpload} className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Upload Now</button>}
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">My Profile</h2>
                        {!editMode && <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"><FiEdit /> Edit Profile</button>}
                    </div>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        {renderField("Full Name", "name", profile.name)}
                        {renderField("Email Address", "email", profile.email)}
                        {renderField("Phone Number", "phone", profile.phone)}
                        {renderField("Address", "address", profile.address)}
                        
                        {/* Role-specific fields */}
                        {profile.role === 'student' && (
                            <>
                                {renderField("Department", "department", profile.department)}
                                {renderField("Class", "class", profile.class)}
                                {renderField("Section", "sec", profile.sec)}
                            </>
                        )}
                        {profile.role === 'proctor' && (
                            <>
                                {renderField("Designation", "designation", profile.designation)}
                                {renderField("Degree", "degree", profile.degree)}
                            </>
                        )}

                        {editMode && (
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2"><FiSave /> Save Changes</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;