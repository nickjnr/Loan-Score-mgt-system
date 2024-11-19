import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Get token from "Bearer <token>"

  if (!token) {
    return res.status(403).json({ err: "Token not provided" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ err: error.message });
  }
};

export { auth };
