import express from 'express'
import { Server } from 'socket.io'
import http from 'http'

// Create an Express app
const app = express()

// Define the port for the Socket.IO server
const PORT = process.env.SOCKET_PORT || 3006

// Create an HTTP server using the Express app
const server = http.createServer(app)

// Create a new Socket.IO server instance
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Handle socket connection events
io.on('connection', (socket) => {

    socket.on('joinRoom', (customerId) => {
        // Join the room identified by the customerId
        socket.join(customerId);
    });

    socket.on('disconnect', () => {
        //on disconnect
    })
})

// Start the HTTP server with the Socket.IO server
server.listen(PORT, () => {
    console.log(`Socket is running on port ${PORT}`)
})

export default io
