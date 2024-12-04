import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;

export default class JwtServices{
  
  static verifyToken (token)  {
    return jwt.verify(token, JWT_SECRET);
  };

  static createToken (payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  };
}
