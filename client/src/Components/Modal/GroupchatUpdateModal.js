import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../Context/ChatContext";
import { UserContext } from "../../Context/UserContext";
import UserBadgeItem from "../UserBadgeItem/UserBadgeItem";
import UserListItem from "../UserListItem/UserListItem";
export default function GroupchatUpdateModal({ fetchMessage }) {
  const {
    selectedChat,
    results,
    renameGroupChat,
    getUsers,
    inviteMember,
    removeMember,
  } = useContext(ChatContext);

  const {
    authState: { user },
  } = useContext(UserContext);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState();
  const [loading, setLoading] = useState(false);
  const [renameGroup, setRenameGroup] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();

  //Thay đổi tên nhóm
  const handleRename = async () => {
    if (!renameGroup) return;
    try {
      setRenameLoading(true);
      await renameGroupChat({
        chatId: selectedChat._id,
        chatName: renameGroup,
      });
      setRenameLoading(false);
      setRenameGroup("");
    } catch (error) {
      toast({
        title: `${t("error_search_title")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
  };

  //TÌm thành viên
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      await getUsers(query);
      setLoading(false);
    } catch (error) {
      toast({
        title: `${t("error_search_title")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  //Thêm thành viên
  const handleInviteUser = async (newUser) => {
    if (selectedChat.users.find((user) => user._id === newUser._id)) {
      toast({
        title: `${t("user_group_already")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: `${t("only_admin_add")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);
      await inviteMember({
        chatId: selectedChat._id,
        userId: newUser._id,
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: `${t("error_search_title")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  //Rời/hoạc xóa thành viên khỏi nhóm
  const handleRemove = async (userData) => {
    if (selectedChat.groupAdmin._id !== user._id && userData._id !== user._id) {
      toast({
        title: `${t("only_admin_delete")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      setLoading(true);
      await removeMember({
        chatId: selectedChat._id,
        userId: userData._id,
      });
      setLoading(false);
      fetchMessage();
    } catch (error) {
      toast({
        title: `${t("error_search_title")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>
            <FormControl d="flex">
              <Input
                placeholder={`${t("name_group_chat")}`}
                mb={3}
                value={renameGroup}
                onChange={(e) => setRenameGroup(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
                fontSize="15px"
              >
                {t("update_group")}
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder={`${t("name_invite_group")}`}
                mb={1}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="red.500"
                size="md"
              />
            ) : (
              results?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleInviteUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              {t("loggout_group")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
