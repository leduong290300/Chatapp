import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import { Box } from "@chakra-ui/react";
import Navigation from "../Components/Navigation/Navigation";
import ListChat from "../Components/ListChat/ListChat";
import ScreenChat from "../Components/ScreenChat/ScreenChat";
export default function Chat() {
  const {
    authState: { user },
  } = useContext(UserContext);

  return (
    <div style={{ width: "100%" }}>
      {user && <Navigation />}
      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <ListChat />}
        {user && <ScreenChat />}
      </Box>
    </div>
  );
}
