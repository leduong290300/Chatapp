import React, { useState, useContext } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from "@chakra-ui/react";
import { VStack } from "@chakra-ui/layout";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { useHistory } from "react-router-dom";
export default function LoginForm() {
  const [show, setShow] = useState(false);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(UserContext);
  const history = useHistory();
  const handleChangeShow = () => {
    setShow(!show);
  };
  const { t } = useTranslation();

  const handleLogin = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!regex.test(email)) {
      toast({
        title: `${t("regax_email")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (!email || !password) {
      toast({
        title: `${t("fields")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const loginData = await loginUser({ email, password });
      if (loginData.success) {
        toast({
          title: loginData.message ? `${t("login_success")}` : "",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        history.push("/chat");
      } else {
        toast({
          title: loginData.message,
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (error) {
      toast({
        title: `${t("server_error")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  return (
    <VStack>
      <FormControl isRequired>
        <FormLabel>{t("email")}</FormLabel>
        <Input
          placeholder="example@example.com"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>{t("password")}</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="5.5em">
            <Button h="1.75em" size="sm" onClick={handleChangeShow}>
              {show ? `${t("show")}` : `${t("hide")}`}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: "15px" }}
        onClick={handleLogin}
        isLoading={loading}
      >
        {t("button_login")}
      </Button>
    </VStack>
  );
}
