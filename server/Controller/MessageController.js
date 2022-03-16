const asyncHandler = require("express-async-handler");
const Message = require("../Models/MessageModel");
const Chat = require("../Models/ChatModel");
const User = require("../Models/UserModel");

/**
 * @Route api/message/send
 * @Description Gủi tin nhắn
 * @Protect Protect
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  let newMessage = {
    sender: req.userId,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name image");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name image email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { lastMessage: message });

    res.json({ success: true, message });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @Route api/message/:chatId
 * @Description Tải tin nhắn
 * @Protect Protect
 */
const getMessage = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name image email")
      .populate("chat");
    res.json({ success: true, messages });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { getMessage, sendMessage };
