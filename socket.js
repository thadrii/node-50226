const MessageService = require('./services/messageService')
const AiService = require('./services/aiService')

const messageService = new MessageService()
const aiService = new AiService()

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
            if (!data?.username || !data?.message) return
            try {
                await messageService.create(data)
                const messages = await messageService.getAll()
                io.emit('all-messages', messages)

                io.emit('writing', 'IA')
                try {
                    const answer = await aiService.reply(messages)
                    if (answer) {
                        await messageService.create({ username: 'IA', message: answer })
                        io.emit('all-messages', await messageService.getAll())
                    }
                } catch (err) {
                    console.error('Error al consultar la IA:', err.message)
                    io.emit('all-messages', [
                        ...messages,
                        { username: 'IA', message: 'No pude responder ahora (revisa si Ollama/API está activo).' }
                    ])
                }
            } catch (err) {
                console.error('Error al guardar mensaje:', err)
            }
        })
    })
}
