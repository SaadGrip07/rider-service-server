import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // Correct import for jsonwebtoken

// Load environment variables from .env file
dotenv.config();

// Get the secret key from the environment variables
const JWT_SECRET_KEY = process.env.JWT_SECRET;

if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in the token
 * @param {String} expiresIn - Expiration time for the token (default: 7 days)
 * @returns {String} - The signed JWT token
 */
const generateAuthToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn });
};

export default generateAuthToken;
