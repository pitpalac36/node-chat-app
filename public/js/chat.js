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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// ignoreQueryPrefix true -> make sure the question mark goes away 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })


/* will be called after rendering messages and after rendering location
   scroll down if user is following the latest messages; 
   if user is digging through chat history then new messages won't trigger autoscroll
*/
const autoscroll = () => {
    // new message element
    const $newMessage = messages.lastElementChild

    // height of $newMessage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    // total height (margin taken into account)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible heigth
    const visibleHeigth = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeigth

    // if user was at the bottom before the last message
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('h:mm a')     // formatting timestamp with momentjs (hour:minutes AM/PM)
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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
            return alert(error)
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