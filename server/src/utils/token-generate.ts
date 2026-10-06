import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const generateAccessToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}


export const generateRefreshToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}