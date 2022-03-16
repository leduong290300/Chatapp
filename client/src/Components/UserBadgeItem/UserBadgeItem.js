import { Box } from "@chakra-ui/react";
import React from "react";
import { DeleteIcon } from "@chakra-ui/icons";
export default function UserBadgeItem({ user, handleFunction }) {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      backgroundColor="purple"
      color="white"
      cursor="pointer"
      d="flex"
      alignItems="center"
      onClick={handleFunction}
    >
      {user.name}
      <DeleteIcon pl={1} />
    </Box>
  );
}
