const MessageService = require('./services/messageService')
const messageService = new MessageService()

module.exports = (io) => {
    io.on('connection', async (socket) => {
        console.log("un nuevo usuario conectado")
        try {
            const messages = await messageService.getAll()
            socket.emit('all-messages', messages)
        } catch (err) {
            console.error('Error al cargar mensajes:', err)
        }

        socket.on('writing', (username) => {
            socket.broadcast.emit('writing', username)
        })

        socket.on('new-message', async (data) => {
            try {
                await messageService.create(data)
                const messages = await messageService.getAll()
                io.emit('all-messages', messages)
            } catch (err) {
                console.error('Error al guardar mensaje:', err)
            }
        })
    })
}
