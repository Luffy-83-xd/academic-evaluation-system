import axios from 'axios';

const instance = axios.create({
  // Your backend server's base URL
  baseURL: 'process.env.https://aems-backend-1ld0.onrender.com',
});

export default instance;