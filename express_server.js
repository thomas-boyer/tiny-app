const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const morgan = require('morgan');

const rootRoutes = require('./routes/root_routes.js');
const urlRoutes = require('./routes/url_routes.js');
const { userDatabase, urlDatabase } = require('./databases.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));
app.use(morgan('dev'));

app.use('/urls', urlRoutes);
app.use('/', rootRoutes);

const PORT = 8080;

app.set('view engine', 'ejs');

//Redirects from shortURL to longURL
app.get('/u/:shortURL', (req, res) =>
  {
    const shortURL = req.params.shortURL;

    //Check if shortURL exists in the database
    if (!urlDatabase[shortURL])
    {
      res.status(400).send("400 Error: Requested TinyURL does not exist.<p><a href='/'>Return to main page</a></p>")
    }
    //If so, redirect to the longURL it points to
    res.redirect(urlDatabase[shortURL].longURL);
  });

app.listen(PORT, () =>
  {
    console.log(`Example app listening on port ${PORT}!`);
  });