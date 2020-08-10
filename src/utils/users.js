const users = []

// Add user
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data
    if (!username  || !room) {
        return {
            error : 'Username and room are required!'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if (existingUser) {
        return {
            error : 'Username is in use!'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}


// Remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) { // found a match
        return users.splice(index, 1)[0]   // remove 1 item starting at index; return the individual item
    }
}


// Get user
const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user
}


// Get users in room
const getUsersInRoom = (room) => {
    const roomUsers = users.filter((user) => user.room === room)
    return roomUsers
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}