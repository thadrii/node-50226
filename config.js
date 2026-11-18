module.exports = {
  db: {
    host: 'localhost',
    user: '',
    password: '',
    database: 'mydb02',
    port:27017
  },
  jwt: {
    secret: 'secret-key'
  },
  ai: {
    url: process.env.AI_URL || 'http://localhost:11434/v1/chat/completions',
    model: process.env.AI_MODEL || 'llama3.2:latest',
    apiKey: process.env.AI_API_KEY || ''
  }
}