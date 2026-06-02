import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const socket = io(SOCKET_URL, {
  autoConnect: false
});
