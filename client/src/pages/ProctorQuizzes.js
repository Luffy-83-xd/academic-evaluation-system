import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiEye } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const ProctorQuizzes = () => {
  const { token } = useContext(AuthContext);
  // State for the creation form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('');

  // State for the list of quizzes
  const [createdQuizzes, setCreatedQuizzes] = useState([]);

  const fetchCreatedQuizzes = async () => {
    try {
        const response = await api.get('/quizzes', { headers: { Authorization: token } });
        // Assuming the proctor only wants to see quizzes they created
        // You might need to adjust this logic based on your user model from context
        setCreatedQuizzes(response.data.data);
    } catch (error) {
        console.error("Could not fetch quizzes", error);
    }
  };

  useEffect(() => {
    fetchCreatedQuizzes();
  }, [token]);


  const handleQuestionChange = (index, event) => {
    const newQuestions = [...questions];
    newQuestions[index][event.target.name] = event.target.value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, event) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = event.target.value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, qIndex) => qIndex !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const payload = { title, subject, deadline, questions, duration };
      await api.post('/quizzes', payload, {
        headers: { Authorization: token }
      });
      setMessage('Quiz created successfully!');
      // Reset form and refresh list
      setTitle('');
      setSubject('');
      setDeadline('');
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
      setDuration('');
      fetchCreatedQuizzes();
    } catch (error) {
      setMessage('Failed to create quiz. Please check all fields.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Quiz Creation Form */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
            {/* Form content remains the same... */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Title Input (col-span-1) */}
                <div className="md:col-span-1">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Quiz Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm ring-1 ring-gray-400" required />
                </div>
                {/* Subject Input (col-span-1) */}
                <div className="md:col-span-1">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm ring-1 ring-gray-400" required />
                </div>
                {/* Deadline Input (col-span-1) */}
                <div className="md:col-span-1">
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Submission Deadline</label>
                    <input type="datetime-local" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm ring-1 ring-gray-400" required />
                </div>
                {/* NEW Duration Input (col-span-1) */}
                <div className="md:col-span-1">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                    <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm ring-1 ring-gray-400" required />
                </div>
            </div>
            {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-6 border border-gray-200 rounded-lg relative"><h3 className="text-lg font-semibold mb-4">Question {qIndex + 1}</h3>{questions.length > 1 && (<button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><FiTrash2 /></button>)}<div className="space-y-4"><input type="text" name="questionText" placeholder="Enter the question" value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, e)} className="block w-full border-gray-300 rounded-md shadow-sm" required /><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{q.options.map((opt, oIndex) => (<input key={oIndex} type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e)} className="block w-full border-gray-300 rounded-md shadow-sm" required />))}</div><select name="correctAnswer" value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, e)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required><option value="">Select Correct Answer</option>{q.options.map((opt, oIndex) => opt && <option key={oIndex} value={opt}>{opt}</option>)}</select></div></div>))}
            <div className="flex justify-between items-center"><button type="button" onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"><FiPlus />Add Question</button><button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"><FiSave />{isLoading ? 'Saving...' : 'Save Quiz'}</button></div>
            {message && <p className="text-center font-medium mt-4">{message}</p>}
        </form>
      </div>
      
      {/* List of Created Quizzes */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Created Quizzes</h2>
        <div className="bg-white rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
                {createdQuizzes.length > 0 ? createdQuizzes.map(quiz => (
                    <li key={quiz._id} className="p-4 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">{quiz.title}</p>
                            <p className="text-sm text-gray-500">{quiz.subject}</p>
                        </div>
                        <Link to={`/proctor/quiz/results/${quiz._id}`} className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-700">
                           <FiEye /> View Results
                        </Link>
                    </li>
                )) : <p className="p-4 text-center text-gray-500">You haven't created any quizzes yet.</p>}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default ProctorQuizzes;