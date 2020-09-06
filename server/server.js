const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { PORT, dbUri } = require('./constants/constants')
const { graphqlHTTP } = require('express-graphql')

const app = express()

app.use(express.json({ extended: true }))
app.use(cors())

app.use('/api/auth', require('./routes/authentication/authentication-routes'))

app.use('/', graphqlHTTP({}))

async function connectMongo() {
  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
  } catch (error) {
    console.log(error)
  }
}
connectMongo()

app.listen(PORT, console.log(`Server was started on port ${PORT}`))
