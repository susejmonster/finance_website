// socketIOService.js
import { io } from 'socket.io-client';

class SocketIOService {
  static instance = null;

  static getInstance() {
    if (!SocketIOService.instance) {
      SocketIOService.instance = new SocketIOService();
    }
    return SocketIOService.instance;
  }

  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io("http://localhost:3007", {
        transports: ["websocket"], // Allow native WebSockets
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        console.log("Connected to Socket.IO server!");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Socket.IO uses explicit event names instead of one generic message handler
  sendMessage(eventName, data) {
    if (this.socket && this.socket.connected) {
      // Socket.IO stringifies JSON automatically
      this.socket.emit(eventName, data);
      return true;
    }
    return false;
  }

  // Wrappers for adding and removing listeners
  addCallback(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  removeCallback(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }
}

export default SocketIOService.getInstance();