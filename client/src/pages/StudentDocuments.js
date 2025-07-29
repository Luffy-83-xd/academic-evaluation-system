import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiUpload, FiTrash2, FiFileText, FiCheckCircle, FiXCircle, FiClock, FiEye, FiMessageCircle } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios'; // Your centralized axios instance

const StudentDocuments = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { token } = useContext(AuthContext);

  // Function to fetch documents
  const fetchDocuments = useCallback(async () => {
  try {
    const response = await api.get('/documents/student', {
      headers: { Authorization: token },
    });
    setDocuments(response.data.data);
  } catch (err) {
    setError('Failed to fetch documents.');
  }
}, [token]); // Add token as a dependency for useCallback

  // Fetch documents when the component mounts
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('fileName', selectedFile.name);

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });
      // Refresh the document list after successful upload
      fetchDocuments();
      setSelectedFile(null); // Clear the file input
    } catch (err) {
      setError('File upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // TODO: Add handleDelete function later

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <FiCheckCircle className="text-green-500" />;
      case 'Rejected':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Upload New Document</h2>
        <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center border-2 border-dashed rounded-lg p-4">
            <FiUpload className="text-gray-500 mr-4" size={24} />
            <input 
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || !selectedFile}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">My Submitted Documents</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <li key={doc._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FiFileText className="text-gray-500 mr-4" size={20} />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{doc.fileName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* View Button */}
                    <a
                      href={`http://localhost:8080/${doc.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Document"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiEye size={18} />
                    </a>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm font-medium">{doc.status}</span>
                    </div>

                    {/* View Feedback Button (only appears if feedback exists) */}
                    {doc.feedback && (
                      <button 
                        onClick={() => toast.info(`Feedback: ${doc.feedback}`)}
                        title="View Feedback"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiMessageCircle size={18} />
                      </button>
                    )}

                    {/* Delete Button (only appears if status is 'Pending') */}
                    {doc.status === 'Pending' && (
                      <button className="text-red-500 hover:text-red-700">
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">You haven't uploaded any documents yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDocuments;