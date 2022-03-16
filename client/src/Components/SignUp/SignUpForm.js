import React, { useState, useContext } from "react";
import { VStack } from "@chakra-ui/layout";
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { useHistory } from "react-router-dom";
export default function SignUpForm() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [image, setImage] = useState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const { registerUser } = useContext(UserContext);
  const history = useHistory();

  const handleChangeShow = () => {
    setShow(!show);
  };

  const uploadImage = (image) => {
    setLoading(true);
    if (image === undefined) {
      toast({
        title: `${t("upload_image_to_cloudinary")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (image.type === "image/jpeg" || image.type === "image/png") {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "alo_chat");
      data.append("resource_type", "image");
      data.append("cloud_name", "leduong");
      data.append("folder", "avatar");
      fetch("https://api.cloudinary.com/v1_1/leduong/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setImage(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: `${t("upload_image_to_cloudinary")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const handleRegister = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!name || !email || !password || !confirm_password) {
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

    if (password !== confirm_password) {
      toast({
        title: `${t("password_not_patch")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

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
    try {
      const registerData = await registerUser({ name, email, password, image });
      if (registerData.success) {
        toast({
          title: registerData.message ? `${t("register_success")}` : "",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        history.push("/chat");
      } else {
        toast({
          title: registerData.message,
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { t } = useTranslation();
  return (
    <VStack>
      <FormControl isRequired>
        <FormLabel>{t("name")}</FormLabel>
        <Input
          name="name"
          placeholder="Nguyen Van A"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

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
          <InputRightElement width="4.5em">
            <Button h="1.75em" size="sm" onClick={handleChangeShow}>
              {show ? `${t("show")}` : `${t("hide")}`}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>{t("confirm_password")}</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            name="confirm_password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5em">
            <Button h="1.75em" size="sm" onClick={handleChangeShow}>
              {show ? `${t("show")}` : `${t("hide")}`}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel>{t("upload_image")}</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: "15px" }}
        isLoading={loading}
        onClick={handleRegister}
      >
        {t("button_register")}
      </Button>
    </VStack>
  );
}
