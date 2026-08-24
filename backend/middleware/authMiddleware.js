import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'explore_tamilnadu_enterprise_jwt_secret_key_2026_super_secure';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, message: 'Not authorized, no valid token provided' });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      req.user = user;
      return next();
    } catch (error) {
      console.warn('Auth token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Not authorized, no authorization header provided' 
  });
};

export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      }
    } catch (error) {
      // Ignored for optional auth
    }
  }
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized. Please authenticate to access this resource.' 
      });
    }

    const userRole = req.user.role || 'user';
    const isAllowed = roles.includes(userRole) || 
      (roles.includes('admin') && userRole === 'super_admin') ||
      (roles.includes('super_admin') && userRole === 'admin');

    if (!isAllowed) {
      return res.status(403).json({ 
        success: false,
        message: `Role (${userRole}) is not authorized to access this resource` 
      });
    }
    next();
  };
};
