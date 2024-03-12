const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/userModel')
require('dotenv').config()

// connect to db
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async function (req, res) {
  users = await User.find({})
  users = users.map(user => {
    logs = user.logs.map(log => {
      return {
        description: log.description,
        duration: log.duration,
        date: new Date(log.date).toDateString()
      }
    })

    return {
      _id: user._id,
      username: user.username,
      logs: logs
    }
  })

  res.json(users)
})

app.post('/api/users', async function (req, res) {
  const username = req.body.username
  user = await User.findOne({ username: username})
  
  if (!user) {
    user = new User({ username: username })
    user = await user.save()
  }

  res.json({ username: user.username, _id: user._id })
})

app.post('/api/users/:id/exercises', async function (req, res) {
  user = await User.findOne({ _id: req.params.id })

  const { description, duration, date } = req.body

  user.logs.push({ description, duration: parseInt(duration), date: date ? date : new Date() })
  user = await user.save()

  // get latest insert exercises
  log = user.logs[user.logs.length-1]

  res.json({ username: user.username, description: log.description, duration: log.duration, date: new Date(log.date).toDateString(), _id: user._id })
})

app.get('/api/users/:id/logs', async function (req, res) {
  let { from, to, limit } = req.query
  
  if (from) {
    from = new Date(from)
  }
  
  if (to) {
    to = new Date(to)
  }
  
  console.log(req.query.from)
  user = await User.findOne({_id: req.params.id})
  
  // filter the logs
  user.logs = user.logs.filter(log => {
    // console.log(log.date >= from, log.date <= to, (log.date >= from && log.date <= to))
    if (from && to) {
      return log.date >= from && log.date <= to
    }

    return true
  })

  // limit the logs
  if (limit) {
    user.logs = user.logs.slice(0, parseInt(limit))
  }

  // format the logs
  user.formattedLogs = user.logs.map(log => {
      return {
        _id: log._id,
        description: log.description,
        duration: log.duration,
        date: new Date(log.date).toDateString()
      }
  })

  res.json({username: user.username, count: user.logs.length, _id: user._id, log: user.formattedLogs })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
