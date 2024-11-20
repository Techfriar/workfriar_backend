import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token (JWT) for a specific user.
 * @param {string} userId - The ID of the user for whom the token will be generated.
 * @returns {string} The generated JSON Web Token.
 */
const generateToken = (userId) => {
  // Define the 'secret' to be used for signing the JWT.
  // If 'process.env.JWT_SECRET' is available, use it; otherwise, use the predefined 'secret'.
  const secret = process.env.JWT_SECRET || '<<<<<++++random++++secret++++string++++>>>>>>';

  // Generate the JWT containing the 'userId'.
  // The 'jwt.sign' method signs the payload with the provided 'secret' and sets the expiration to '30d' (30 days).
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '1d',
  });

  // Return the generated JSON Web Token.
  return token;
};

export default generateToken;