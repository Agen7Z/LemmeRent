import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";


export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    console.log("No token found"); // Debugging
    return next(errorHandler(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) {
      console.log("Token is not valid:", err); // Debugging
      return next(errorHandler(403, "Token is not valid!"));
    }
    console.log("Token verified, user:", user); // Debugging
    req.user = user; // Attaches the decoded user info (id and isAdmin) to the request object
    next();
  });
};

// Middleware to verify if the user is an admin
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Admin access required!"));
    }
    next();
  });
};