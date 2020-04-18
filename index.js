require('dotenv').config()
const express = require("express")
const app = express()
const morgan = require("morgan")
const bodyParser = require("body-parser")
const cors = require('cors')
const Person = require('./models/person')

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(express.static('build'))

morgan.token("body", function (req, res, param) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/api/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    persons = persons.filter((p) => p.id !== id);
    response.status(204).json(person).end();
  } else {
    response.status(404).end();
  }
})

app.post("/api/persons", (request, response) => {
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

  const person = persons.find((p) => p.name === body.name)

  if (person) {
    return response.status(400).json({
      error: "name must be unique",
    })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

const randomIntFromInterval = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
