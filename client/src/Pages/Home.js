import React, { useEffect, useContext } from "react";
import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  Spinner,
} from "@chakra-ui/react";
import LoginForm from "../Components/Login/LoginForm";
import SignUpForm from "../Components/SignUp/SignUpForm";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import cookies from "js-cookie";
import { UserContext } from "../Context/UserContext";
import { Redirect } from "react-router-dom";
const languages = [
  {
    code: "vi",
    name: "Tiếng việt",
    country_code: "vi",
  },
  {
    code: "us",
    name: "English",
    country_code: "us",
  },
  {
    code: "kr",
    name: "한국어",
    country_code: "kr",
  },
];
export default function Home() {
  const currentLanguageCode = cookies.get("i18next") || "vi";
  const currentLanguage = languages.find((l) => l.code === currentLanguageCode);
  const {
    authState: { authLoading, isAuthenticated },
  } = useContext(UserContext);
  const { t } = useTranslation();
  useEffect(() => {
    document.body.dir = currentLanguage.dir || "ltr";
  }, [currentLanguage, t]);

  const handleOnChangeLanguage = (e) => {
    i18next.changeLanguage(e.target.value);
  };

  if (authLoading) {
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="blue.500"
      size="xl"
    />;
  } else if (isAuthenticated) return <Redirect to="/chat" />;
  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg={"white"}
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        flexWrap="wrap"
      >
        <Text fontSize="30px" fontFamily="Work sans" color="black">
          Alochat
        </Text>
        <Select
          placeholder={t("choose_language")}
          onClick={handleOnChangeLanguage}
        >
          {languages.map(({ code, name, country_code }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Select>
      </Box>
      <Box
        bg="white"
        color="black"
        borderRadius="lg"
        borderWidth="1px"
        w="100%"
        p={4}
      >
        <Tabs variant="soft-rounded">
          <TabList mb="1em">
            <Tab width="50%">{t("name_button_login")}</Tab>
            <Tab width="50%">{t("name_button_register")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <LoginForm />
            </TabPanel>
            <TabPanel>
              <SignUpForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}
