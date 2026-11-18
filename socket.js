const { Socket } = require("socket.io")

module.exports=(io)=>{
    let messages=[{username:"fake-user", message:"Welcome"}]
    io.on('connection',(socket)=>{
    console.log("un nuevo usuario conectado")
    io.emit('all-messages',messages)
    })
  socket.on('writing', () => {
    socket.broadcast.emit('writing', username)
  
  })
  socket.on('new-message', (data) => {
    messages.push(data)
    io.enit('all-messages', messages)
  })
}
