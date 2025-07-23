import { io } from 'socket.io-client'

const BACKEND_URL = 'http://localhost:9000'

export const socket = io(BACKEND_URL)
