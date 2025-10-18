import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Admin authentication middleware
export const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided, admin authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: 'Admin token is not valid' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account is deactivated' });
    }

    if (admin.isLocked) {
      return res.status(401).json({ message: 'Admin account is temporarily locked' });
    }

    req.adminId = decoded.adminId;
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ message: 'Admin token is not valid' });
  }
};

// Permission check middleware
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    if (!req.admin.hasPermission(resource, action)) {
      return res.status(403).json({ 
        message: `Insufficient permissions. Required: ${resource}.${action}` 
      });
    }

    next();
  };
};

// Role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

export default adminAuth;