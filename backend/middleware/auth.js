import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided. Please log in to access this resource.' 
    });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token. Please log in again.' 
    });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      const requiredRoles = roles.join(', ');
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. You have '${req.user.role}' role, but this action requires one of: ${requiredRoles}. 
        
        Job Requisitions, Offer Management & Talent Pool access is restricted to HR, Recruiters, and Admin users only.
        
        If you believe you should have access, please contact your administrator.`,
        currentRole: req.user.role,
        requiredRoles: roles
      });
    }
    next();
  };
};

export { verifyToken, authorizeRole };
