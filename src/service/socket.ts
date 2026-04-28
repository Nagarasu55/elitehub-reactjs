import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(import.meta.env.VITE_API_BASE_URL);
    }
    return socket;
};