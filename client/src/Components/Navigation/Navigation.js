import React, { useState, useContext } from "react";
import {
  Box,
  Tooltip,
  Button,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Search2Icon, BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { UserContext } from "../../Context/UserContext";
import { ChatContext } from "../../Context/ChatContext";
import ProfileModal from "../Modal/ProfileModal";
import ChatLoading from "../ChatLoading/ChatLoading";
import UserListItem from "../UserListItem/UserListItem";
import { getSender } from "../../Utils/getSender";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

export default function Navigation() {
  const [search, setSearch] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const tooltip_label = `${t("tooltip_label")}`;
  const input_search_label = `${t("input_search")}`;
  const toast = useToast();
  const {
    authState: { user },
    logoutUser,
    getResultSearch,
  } = useContext(UserContext);

  const { accessChat, notification, setNotification, setSelectedChat } =
    useContext(ChatContext);

  const handleLogout = () => logoutUser();

  const handleOnSearch = async () => {
    if (!search) {
      toast({
        title: `${t("label_search")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const results = await getResultSearch(search);
      setLoading(false);
      setSearchResult(results.users);
      setSearch("");
    } catch (error) {
      toast({
        title: `${t("error_search_title")}`,
        description: `${t("error_search_description")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleAccessChat = async (userId) => {
    try {
      setLoadingChat(true);
      await accessChat(userId);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px"
        borderWidth="5px"
      >
        <Tooltip label={tooltip_label} hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <Search2Icon />
            <Text d={{ base: "none", md: "flex" }} px="4">
              {t("tooltip_content")}
            </Text>
          </Button>
        </Tooltip>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="20px" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && `${t("dont_new_message")}`}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((no) => no !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `${t("have_new_message_group")}: ${notif.chat.chatName}`
                    : `${t("have_new_message")}: ${getSender(
                        user,
                        notif.chat.users,
                      )}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.image}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>{t("item_profile")}</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>{t("item_logout")}</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            {t("tooltip_content")}
          </DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={input_search_label}
                fontSize="12px"
              />
              <Button onClick={handleOnSearch}>{t("button_search")}</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAccessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
