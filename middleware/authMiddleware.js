import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET;

if (!JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer'

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded; // Attach decoded data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message });
    }
};

export default authenticate;