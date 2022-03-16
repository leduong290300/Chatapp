const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/verifyToken");
const {
  FetchChats,
  AccessChats,
  CreateGroupChat,
  RenameGroup,
  RemoveFromGroup,
  AddToGroup,
} = require("../Controller/ChatController");

router.route("/").get(verifyToken, FetchChats);
router.route("/access").post(verifyToken, AccessChats);
router.route("/group").post(verifyToken, CreateGroupChat);
router.route("/rename").put(verifyToken, RenameGroup);
router.route("/group_remove").put(verifyToken, RemoveFromGroup);
router.route("/group_add").put(verifyToken, AddToGroup);
module.exports = router;
