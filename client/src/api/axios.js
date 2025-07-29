import axios from 'axios';

const instance = axios.create({
  // Your backend server's base URL
  baseURL: 'http://localhost:8080/api',
});

export default instance;