import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hafsa-jwt-secret-change-in-production-256bit';
const TEST_USER_ID = 'cmq2j9d150000dla9xwevrzl3';

const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET, { expiresIn: '7d' });
console.log(token);
