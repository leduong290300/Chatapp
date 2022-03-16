import React from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";
import "./App.css";
import UserProvider from "./Context/UserContext";
import ChatProvider from "./Context/ChatContext";
import ProtectedRoute from "./Router/ProtectRoute";

export default function App() {
  return (
    <div className="app">
      <UserProvider>
        <ChatProvider>
          <Switch>
            <Route exact path="/" component={Home} />
            <ProtectedRoute exact path="/chat" component={Chat} />
          </Switch>
        </ChatProvider>
      </UserProvider>
    </div>
  );
}
