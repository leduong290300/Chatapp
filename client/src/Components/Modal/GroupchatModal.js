import {
  Box,
  Button,
  FormControl,
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
import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../Context/ChatContext";
import UserListItem from "../UserListItem/UserListItem";
import UserBadgeItem from "../UserBadgeItem/UserBadgeItem";

export default function GroupchatModal({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [nameGroup, setNameGroup] = useState();
  const [selectUser, setSelectUser] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();
  const { getUsers, results, createGroupChat } = useContext(ChatContext);

  //Tìm kiếm thành viên để thêm vào nhóm
  const handleSearchMember = async (query) => {
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

  //Thêm thành viên vào danh dách nhóm
  const handleGroup = (user) => {
    if (selectUser.includes(user)) {
      toast({
        title: `${t("user_group_already")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectUser([...selectUser, user]);
  };

  //Loại thành viên từ danh sách để thêm vào nhóm
  const handleDeleteMember = (userDelete) => {
    setSelectUser(selectUser.filter((select) => select._id !== userDelete._id));
  };

  //Thêm thành viên vào nhóm
  const handleSubmitInvite = async () => {
    if (!nameGroup) {
      toast({
        title: `${t("name_group")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (!selectUser || selectUser < 2) {
      toast({
        title: `${t("count_members")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      await createGroupChat({
        name: nameGroup,
        users: JSON.stringify(selectUser.map((user) => user._id)),
      });
      onClose();
      toast({
        title: `${t("create_group_success")}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: `${t("create_group_failed")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {t("create_chat")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                mb={3}
                placeholder={`${t("name_group_chat")}`}
                value={nameGroup}
                onChange={(e) => setNameGroup(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                mb={1}
                placeholder={`${t("name_invite_group")}`}
                value={search}
                onChange={(e) => handleSearchMember(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap">
              {selectUser.map((userSelect) => (
                <UserBadgeItem
                  key={userSelect._id}
                  user={userSelect}
                  handleFunction={() => handleDeleteMember(userSelect)}
                />
              ))}
            </Box>

            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="red.500"
                size="md"
              />
            ) : (
              results
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitInvite}>
              {t("accept_create_group")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
