import { createContext, useState, useContext } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";

import { apiUrl } from "../Api/Api";

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const {
    authState: { user },
  } = useContext(UserContext);
  const [selectedChat, setSelectedChat] = useState();
  const [results, setResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [message, setMessage] = useState([]);
  const [socketConnect, setSocketConnect] = useState(false);
  const [notification, setNotification] = useState([]);

  // Chọn người để trò chuyển
  const accessChat = async (userId) => {
    try {
      const { data } = await axios.post(`${apiUrl}/chat/access`, { userId });
      if (!chats.find((c) => c._id === data._id))
        setChats([data.FullChat, ...chats]);
      setSelectedChat(data.FullChat);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Tải tin nhắn
  const fetchChats = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/chat`);
      if (data) return setChats(data.results);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Tìm kiếm người dùng để thêm vào nhóm
  const getUsers = async (query) => {
    try {
      const { data } = await axios.get(`${apiUrl}/user/search?search=${query}`);
      setResults(data.users);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Tạo nhóm chat
  const createGroupChat = async (value) => {
    try {
      const { data } = await axios.post(`${apiUrl}/chat/group`, value);
      setChats([data.fullGroupChat, ...chats]);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Cập nhật tên nhóm
  const renameGroupChat = async (newName) => {
    try {
      const { data } = await axios.put(`${apiUrl}/chat/rename`, newName);
      setSelectedChat(data.updatedChat);
      setFetchAgain(!false);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Mời thêm thành viên
  const inviteMember = async (newUser) => {
    try {
      const { data } = await axios.put(`${apiUrl}/chat/group_add`, newUser);
      setSelectedChat(data.added);
      setFetchAgain(!false);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Xóa thành viên khói nhóm
  const removeMember = async (dataDelete) => {
    try {
      const { data } = await axios.put(
        `${apiUrl}/chat/group_remove`,
        dataDelete,
      );
      dataDelete.userId === user._id
        ? setSelectedChat()
        : setSelectedChat(data);
      setFetchAgain(!false);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  // //Gửi tin nhắn
  // const handleSendMessage = async (value) => {
  //   try {
  //     const { data } = await axios.post(`${apiUrl}/message/send`, value);
  //     setMessage([...message, data.message]);
  //   } catch (error) {
  //     if (error.response.data) return error.response.data;
  //     else return { success: false, message: error.message };
  //   }
  // };

  //Tải tin nhắn từ hệ thống
  const handleFetchMessage = async (chatId) => {
    try {
      const { data } = await axios.get(`${apiUrl}/message/${chatId}`);
      setMessage(data.messages);
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };
  const data = {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    accessChat,
    fetchChats,
    getUsers,
    results,
    setResults,
    createGroupChat,
    fetchAgain,
    setFetchAgain,
    renameGroupChat,
    inviteMember,
    removeMember,
    // handleSendMessage,
    handleFetchMessage,
    message,
    setMessage,
    setSocketConnect,
    socketConnect,
    notification,
    setNotification,
  };
  return <ChatContext.Provider value={data}>{children}</ChatContext.Provider>;
};
export default ChatProvider;
