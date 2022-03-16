import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../Context/ChatContext";
import { UserContext } from "../../Context/UserContext";
import { getSender, getSenderFull } from "../../Utils/getSender";
import ProfileModal from "../Modal/ProfileModal";
import GroupchatUpdateModal from "../Modal/GroupchatUpdateModal";
import "./SingleChat.css";
import ListMessage from "../ListMessage/ListMessage";
import io from "socket.io-client";
import axios from "axios";
import { apiUrl } from "../../Api/Api";
import Lottie from "react-lottie";
import animationData from "../../Animation/typing.json";
const endpoint = "https://alo-chat-app.herokuapp.com";

let socket, selectedChatCompare;

export default function SingleChat() {
  const {
    selectedChat,
    setSelectedChat,
    // handleSendMessage,
    handleFetchMessage,
    setSocketConnect,
    setMessage,
    message,
    socketConnect,
    notification,
    setNotification,
    setFetchAgain,
    fetchAgain,
  } = useContext(ChatContext);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { t } = useTranslation();
  const toast = useToast();
  const {
    authState: { user },
  } = useContext(UserContext);

  useEffect(() => {
    fetchMessage();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket = io(endpoint);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnect(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop_typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    socket.on("message_received", (newMessage) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessage.chat._id
      ) {
        if (!notification.includes(newMessage)) {
          setNotification([newMessage, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessage([...message, newMessage]);
      }
    });
  });

  //Tải tin nhắn từ database
  const fetchMessage = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      await handleFetchMessage(selectedChat._id);
      setLoading(false);
      socket.emit("join_chat", selectedChat._id);
    } catch (error) {
      toast({
        title: `${t("error_search_title")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  //Gửi tin nhắn
  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop_typing", selectedChat._id);
      try {
        setNewMessage("");
        const { data } = await axios.post(`${apiUrl}/message/send`, {
          content: newMessage,
          chatId: selectedChat._id,
        });
        setMessage([...message, data.message]);
        socket.emit("new_message", data.message);
      } catch (error) {
        toast({
          title: `${t("error_search_title")}`,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const handleOnChange = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnect) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timeLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timeLength && typing) {
        socket.emit("stop_typing", selectedChat._id);
        setTyping(false);
      }
    }, timeLength);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <GroupchatUpdateModal fetchMessage={fetchMessage} />
              </>
            )}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            p={3}
            bg="#e8e8e8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="message">
                <ListMessage />
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              isRequired
              mt={3}
              position="absolute"
              style={{ left: "0", bottom: "5px", width: "100%" }}
            >
              {isTyping ? (
                <>
                  <Lottie
                    width={70}
                    height={10}
                    style={{ marginBottom: 0, marginLeft: 5 }}
                    options={defaultOptions}
                  />
                </>
              ) : (
                <></>
              )}
              <Input
                variant="outline"
                bg="#e0e0e0"
                value={newMessage}
                onChange={handleOnChange}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="30px" pb={3} fontFamily="Worrk sans">
            {t("slogan")}
          </Text>
        </Box>
      )}
    </>
  );
}
