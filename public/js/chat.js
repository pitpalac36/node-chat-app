const socket = io()

// EVENT ACKNOWLEDGEMENT
// server (emit) -> client (receive) -- acknowledgement --> server
// client (emit) -> server (receive) -- acknowledgement --> client


socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()  // prevent the browser from refreshing the whole page

    const message = e.target.elements.message.value

    //EVENT ACKNOWLEDGEMENT syntax : event name, data, function that runs when the event is acknowledged
    socket.emit('sendMessage', message, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

document.querySelector('#share-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {
            console.log('Location shared!')
        })
    })
})