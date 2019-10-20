const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

// Tämä on oikea viimeisin projekti 

app.use(cors())
app.use(bodyParser.json())
// app.use(morgan('tiny'))

morgan.token('data', function (req, res) { 
    return JSON.stringify(req.body)
})

const loggerFormat = ':data ":method :url" :status :response-time';

app.use(morgan(loggerFormat))

let persons = [
    {
      id: 1,
      name: "Bruce Dickinson",
      number: "030-93385813"
    },
    {
      id: 2,
      name: "Eckhart Tolle",
      number: "0700-696968"
    },
    {
      id: 3,
      name: "Ronnie James Dio",
      number: "666-666-666"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    person 
        ? response.json(person)
        : response.status(404).end()
})

app.get('/api/info', (request, response) => {
    const date = new Date()
    const info = `Phonebook has info for ${persons.length} people. ${date} `

    response.json(info)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const id = Math.floor(Math.random() * 1000)
    return id
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body) {
        return response.status(400).json({
            error: "content missing"
        })
    }

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "Both name and number must be provided"
        })
    }

    if (persons.find(person => person.name.toUpperCase() === body.name.toUpperCase())) {
        return response.status(400).json({
            error: `There is already a person with the name of ${body.name} in the Phonebook`
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.json(persons)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
