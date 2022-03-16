const asyncHandler = require("express-async-handler");
const Chat = require("../Models/ChatModel");
const User = require("../Models/UserModel");

/**
 * @Route api/chat
 * @Description Tải tin nhắn
 * @Protect Protect
 */
const FetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "lastMessage.sender",
          select: "name image email",
        });
        return res.status(200).json({ success: true, results });
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
});

/**
 * @Route api/chat/access
 * @Description Chọn người để trò chuyện
 * @Protect Protect
 */

const AccessChats = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false });
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.userId } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("lastMessage");

  isChat = await User.populate(isChat, {
    path: "lastMessage.sender",
    select: "name image email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.userId, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password",
      );
      return res.status(200).json({ success: true, FullChat });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi",
      });
    }
  }
});

/**
 * @Route api/chat/group
 * @Description Tạo nhóm chat
 * @Protect Protect
 */

const CreateGroupChat = asyncHandler(async (req, res) => {
  let users = JSON.parse(req.body.users);
  users.push(req.user);
  console.log(req);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.userId,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({ fullGroupChat });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
});

/**
 * @Route api/chat/rename
 * @Description Đổi tên nhóm chat
 * @Protect Protect
 */

const RenameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Phòng chat không tồn tại");
  } else {
    res.json({ success: true, updatedChat });
  }
});

/**
 * @Route api/chat/group_rename
 * @Description Xóa/rời khỏi nhóm chat
 * @Protect Protect
 */

const RemoveFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Phòng chat không tồn tại");
  } else {
    res.json(removed);
  }
});

/**
 * @Route api/chat/group_add
 * @Description Thêm thành viên vào nhóm chat
 * @Protect Protect
 */

const AddToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Phòng chat không tồn tại");
  } else {
    res.json({ success: true, added });
  }
});

module.exports = {
  FetchChats,
  AccessChats,
  CreateGroupChat,
  RenameGroup,
  RemoveFromGroup,
  AddToGroup,
};
