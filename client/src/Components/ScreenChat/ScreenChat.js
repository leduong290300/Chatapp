import React, { useContext } from "react";
import { ChatContext } from "../../Context/ChatContext";
import { Box } from "@chakra-ui/react";
import SingleChat from "../SingleChat/SingleChat";

export default function ScreenChat() {
  const { selectedChat } = useContext(ChatContext);
  return (
    <Box
      d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat />
    </Box>
  );
}
