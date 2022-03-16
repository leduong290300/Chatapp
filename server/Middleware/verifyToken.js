const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ success: false, message: "Token không tồn tại" });
  }
};

module.exports = verifyToken;
