const jwt = require("jsonwebtoken");

module.exports = function fetchUser(req, res, next) {
  
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    // your token payload is: { user: { id, name, role? } }
    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
