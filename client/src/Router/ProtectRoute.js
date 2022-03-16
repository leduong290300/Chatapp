import React, { useContext } from "react";
import { Spinner } from "@chakra-ui/react";
import { UserContext } from "../Context/UserContext";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const {
    authState: { authLoading, isAuthenticated },
  } = useContext(UserContext);

  if (authLoading)
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    );

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <>
            <Component {...rest} {...props} />
          </>
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

export default ProtectedRoute;
