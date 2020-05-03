require('dotenv').config()

console.log('process.env.PORT', process.env.PORT)
console.log('process.env.MONGODB_URI', process.env.MONGODB_URI)

const express = require("express")
const app = express()
const morgan = require("morgan")
const bodyParser = require("body-parser")
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

app.use(bodyParser.json())
app.use(express.static('build'))
app.use(express.json())

morgan.token("body", function (req, res, param) {
  return JSON.stringify(req.body);
})

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)

app.get("/api/info", (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.send(
        `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
      )
    })
    .catch(error => next(error))
})

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons.map(person => person.toJSON()))
    })
    .catch(error => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error))
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id
  const body = request.body;
  if (!body.name || body.name.length === 0) {
    let extra = ''
    if (!body.number || body.number.length === 0) {
      extra = " and number"
    }

    return response.status(400).json({
      error: `name${extra} missing`,
    })
  }
 
  if (!body.number || body.number.length === 0) {
    return response.status(400).json({
      error: "number missing",
    })
  }

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => updatedPerson.toJSON())
    .then(updatedAndFormattedPerson => {
      response.json(updatedAndFormattedPerson)
    }) 
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name || body.name.length === 0) {
    let extra = ''
    if (!body.number || body.number.length === 0) {
      extra = " and number"
    }

    return response.status(400).json({
      error: `name${extra} missing`,
    })
  }
 
  if (!body.number || body.number.length === 0) {
    return response.status(400).json({
      error: "number missing",
    })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    }) 
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})