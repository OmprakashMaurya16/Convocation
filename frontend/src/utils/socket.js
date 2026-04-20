import { io } from "socket.io-client";
import { getApiBaseUrl } from "./api";

export const createSocketClient = () =>
  io(getApiBaseUrl(), {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });
