import axios, { AxiosInstance} from 'axios';


export const serverClient: AxiosInstance = axios.create({
  baseURL: process.env.BACKEND_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});