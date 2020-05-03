const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}
/*
const password = process.argv[2]

const url =
  `mongodb+srv://alikerroin:${password}@cluster0-gy21y.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`
*/
const url = process.env.MONGODB_URI

console.log('useCreateIndex')
mongoose.set('useCreateIndex', true);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3)
{
    Person
    .find({})
    .then(persons => {
        console.log('phonebook:')
        persons.forEach((person) => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
     })
}
else if (process.argv.length === 5)
{
    const name = process.argv[3]
    const number = process.argv[4]
    
    const person = new Person({
        name: name,
        number: number
    })
    
    person.save().then(response => {
      console.log(`added ${person.name} number ${person.number} to phonebook`)
      mongoose.connection.close()
    })
}
else
{
    console.log('give password, name and number as argument')
}