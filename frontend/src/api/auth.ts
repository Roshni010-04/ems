import api from "./axios";
import { AuthUser } from "../types";

export const loginRequest = async (email: string, password: string) => {
  const res = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
    email,
    password,
  });
  return res.data;
};

export const logoutRequest = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getMeRequest = async () => {
  const res = await api.get<{ user: AuthUser }>("/auth/me");
  return res.data;
};
