import axios, {AxiosInstance} from "axios";



export const appClient: AxiosInstance = axios.create({
    baseURL: process.env.APP_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})