import { createContext, useEffect, useReducer } from "react";
import { userReducer } from "../Reducer/UserReducer";
import axios from "axios";
import setAuthToken from "../Utils/setAuthToken";
import { apiUrl } from "../Api/Api";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(userReducer, {
    authLoading: true,
    isAuthenticated: false,
    user: null,
  });

  //Kiểm tra xem người dùng đã đăng nhập hay chưa
  const loadUser = async () => {
    if (localStorage["user_token"]) {
      setAuthToken(localStorage["user_token"]);
    }

    try {
      const response = await axios.get(`${apiUrl}/user`);
      if (response.data.success) {
        dispatch({
          type: "SET_AUTH",
          payload: { isAuthenticated: true, user: response.data.user },
        });
      }
    } catch (error) {
      localStorage.removeItem("user_token");
      setAuthToken(null);
      dispatch({
        type: "SET_AUTH",
        payload: { isAuthenticated: false, user: null },
      });
    }
  };
  useEffect(() => loadUser(), []);

  //Đăng kí tài khoản
  const registerUser = async (userForm) => {
    try {
      const response = await axios.post(`${apiUrl}/user/register`, userForm);
      if (response.data.success)
        localStorage.setItem("user_token", response.data.accessToken);
      localStorage.setItem("user_id", response.data.userId);
      await loadUser();

      return response.data;
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Đăng nhập tài khoản
  const loginUser = async (userForm) => {
    try {
      const response = await axios.post(`${apiUrl}/user/login`, userForm);
      if (response.data.success)
        localStorage.setItem("user_token", response.data.accessToken);
      localStorage.setItem("user_id", response.data.userId);
      await loadUser();

      return response.data;
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  //Đẵng xuất tài khoản
  const logoutUser = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_id");
    dispatch({
      type: "SET_AUTH",
      payload: { isAuthenticated: false, user: null },
    });
  };

  //Tìm kiếm
  const getResultSearch = async (search) => {
    try {
      const response = await axios.get(
        `${apiUrl}/user/search?search=${search}`,
      );
      if (response.data.success) return response.data;
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };
  const data = {
    loadUser,
    authState,
    registerUser,
    loginUser,
    logoutUser,
    getResultSearch,
  };

  return <UserContext.Provider value={data}>{children}</UserContext.Provider>;
};
export default UserProvider;
