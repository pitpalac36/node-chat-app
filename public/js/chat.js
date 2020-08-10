const socket = io()

// EVENT ACKNOWLEDGEMENT
// server (emit) -> client (receive) -- acknowledgement --> server
// client (emit) -> server (receive) -- acknowledgement --> client

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#url-template').innerHTML

// Options
// ignoreQueryPrefix true -> make sure the question mark goes away 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('h:mm a')     // formatting timestamp with momentjs (hour:minutes AM/PM)
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()  // prevent the browser from refreshing the whole page

    // disable the form once it's been submitted
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    //EVENT ACKNOWLEDGEMENT syntax : event name, data, function that runs when the event is acknowledged
    socket.emit('sendMessage', message, (error) => {
        // enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})


$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {
            console.log('Location shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'   // redirect user to join page
    }
})