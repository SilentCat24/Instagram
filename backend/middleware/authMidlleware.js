const jwt=require('jsonwebtoken');
const db=require('../config/db');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    // Optionally fetch user from DB and attach to req.user
    db.query("SELECT id, username, email FROM users WHERE id = ? LIMIT 1", [decoded.id], (dbErr, rows) => {
      if (dbErr) return res.status(500).json({ message: "DB error" });
      if (!rows.length) return res.status(401).json({ message: "User not found" });
      req.user = rows[0];
      next();
    });
  });
};
