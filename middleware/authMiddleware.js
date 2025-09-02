const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers["authorization"]; // frontend से आने वाला token

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized, token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // user id अब req.user में आ जाएगी
    next(); // आगे जाने दो
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};
