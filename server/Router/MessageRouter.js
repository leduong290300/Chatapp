const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/verifyToken");
const { sendMessage, getMessage } = require("../Controller/MessageController");

router.route("/send").post(verifyToken, sendMessage);
router.route("/:chatId").get(verifyToken, getMessage);

module.exports = router;
