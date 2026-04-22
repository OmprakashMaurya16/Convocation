import { io } from "socket.io-client";
import { getApiBaseUrl } from "./api";

export const createSocketClient = ({ token } = {}) =>
  io(getApiBaseUrl(), {
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: token ? { token } : undefined,
  });
