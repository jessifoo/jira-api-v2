const express = require('express')
const path = require('path')
const hbs = require('hbs')
const jiraRouter = require('./routers/jira')
const bodyparser = require('body-parser');
const jira = require('./utils/jira')

const app = express()
// const port = process.env.PORT
const port = 8000

// Define paths for express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname,  '../templates/views')
const partialsPath = path.join(__dirname,  '../templates/partials')

// Setup handlebards engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.json());
app.use(express.static(publicDirectoryPath))
app.use(jiraRouter)

// render index page
app.get('', (req, res) => {
  jira.getAllBoards((error, data) => {
    if(error){
      const error = error
    }
    res.render('index', {
      title: 'Jira Cards',
      name: 'Curatio',
      todos: data,
      sprint: false
    })
  })

})

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
  
})