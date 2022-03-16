const asyncHandler = require("express-async-handler");
const User = require("../Models/UserModel");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

/**
 * @Route api/user
 * @Description Kiem tra xem nguoi dung dang nhap hay chua
 * @Protect Public
 */
const AuthUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Người dùng chưa đăng nhập" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @Route api/user/register
 * @Description Đăng kí tài khoản
 * @Protect Public
 */
const RegisterUser = asyncHandler(async (req, res) => {
  const { name, email, password, image } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email đăng kí tài khoản đã được sử dụng",
      });
    }
    const hashPassword = await argon2.hash(password);
    const newUser = new User({ name, email, password: hashPassword, image });
    await newUser.save();

    // Cấp token cho người đăng kí mới
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
    );

    res.json({
      success: true,
      message: "Đăng kí tài khoản thành công",
      accessToken,
      userId: newUser._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
    });
  }
});

/**
 * @Route api/user/login
 * @Description Đăng nhập tài khoản
 * @Protect Public
 */
const LoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      accessToken,
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
    });
  }
});

/**
 * @Route api/user/search?search=
 * @Description Tim kiem nguoi dung theo ten hoac email
 * @Protect Public
 */

const GetAllUsers = asyncHandler(async (req, res) => {
  const keywords = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keywords);
  res.json({ success: true, users });
});

module.exports = { AuthUser, RegisterUser, LoginUser, GetAllUsers };
