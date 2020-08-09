const express = require('express')
const path = require('path')   // core node module
const http = require('http')   // core node module
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)

// configure socket.io (called with raw http server)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')


// setup Express server
app.use(express.static(publicDirectoryPath))


// when the client is able to connect
/*
    io.emit -> emits the event to every single connected client
    socket.broadcast.emit -> emits the event to every single connected client EXCEPT THE CURRENT ONE
    socket.emit -> emits the event to the current client
*/
io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', message)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })
    
    socket.on('disconnect', () => {
        // no need to use broadcast; the client has been disconnected => no chance for him to get the message
        io.emit('message', 'A user has left.')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})