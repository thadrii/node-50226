const MessageService = require('./services/messageService')
const AiService = require('./services/aiService')

const messageService = new MessageService()
const aiService = new AiService()

// ponytail: cola en memoria para una sola instancia; usar Redis/BullMQ si escala a varios procesos
function buildContext(all, saved) {
    const savedId = String(saved._id)
    return all
        .filter((m) => String(m._id) !== savedId && (String(m._id) < savedId || m.username === 'IA'))
        .concat(saved)
}

module.exports = (io) => {
    let aiQueue = Promise.resolve()

    io.on('connection', async (socket) => {
        console.log("un nuevo usuario conectado")

        socket.on('writing', (username) => {
            socket.broadcast.emit('writing', username)
        })

        socket.on('new-message', async (data) => {
            if (!data?.username || !data?.message) return
            try {
                const saved = await messageService.create(data)
                io.emit('all-messages', await messageService.getAll())

                aiQueue = aiQueue.then(async () => {
                    io.emit('writing', 'IA')
                    try {
                        const all = await messageService.getAll()
                        const answer = await aiService.reply(buildContext(all, saved), saved.username)
                        if (answer) {
                            await messageService.create({ username: 'IA', message: answer })
                            io.emit('all-messages', await messageService.getAll())
                        }
                    } catch (err) {
                        console.error('Error al consultar la IA:', err.message)
                        const latest = await messageService.getAll()
                        io.emit('all-messages', [
                            ...latest,
                            { username: 'IA', message: 'No pude responder ahora (revisa si Ollama/API está activo).' }
                        ])
                    }
                })
            } catch (err) {
                console.error('Error al guardar mensaje:', err)
            }
        })

        try {
            const messages = await messageService.getAll()
            socket.emit('all-messages', messages)
        } catch (err) {
            console.error('Error al cargar mensajes:', err)
        }
    })
}
