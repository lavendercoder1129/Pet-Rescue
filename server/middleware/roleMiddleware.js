/**
 * Role-Based Access Control Middleware
 * Restricts route access to specified roles.
 * Must be mounted AFTER verifyAuth middleware.
 *
 * @param  {...string} allowedRoles - E.g. 'admin', 'rescuer', 'donor'
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to permission check.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${allowedRoles.join(', ')}] role(s).`,
      });
    }

    next();
  };
};

export default requireRoles;
