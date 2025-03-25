import ApiError from "../utils/ApiError.js";

/**
 * Middleware to check if the authenticated user is an Admin
 */
export const isAdmin = (req, res, next) => {
  try {
    // User is already attached to req from isAuthenticated middleware
    const user = req.user;
    
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }
    
    // Check if the user has an admin role
    // This assumes that the user object has a role property or we can determine
    // admin status from the collection/model the user belongs to
    if (user.role !== "Admin" && user.constructor.modelName !== "Admin") {
      throw new ApiError(403, "Admin access required for this operation");
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the authenticated user is a Teacher
 */
export const isTeacher = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }
    
    if (user.role !== "Teacher" && user.constructor.modelName !== "Teacher") {
      throw new ApiError(403, "Teacher access required for this operation");
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
