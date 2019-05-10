const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session')
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));

const morgan = require('morgan');
app.use(morgan('dev'));

const bcrypt = require('bcrypt');

const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {};

const users = {};


function generateRandomString()
{
  let result = '';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 6; i++)
  {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function emailFound(email)
{
  for (user in users)
  {
    if (users[user].email === email) return users[user];
  }
  return false;
}

function checkHTTP(url)
{
  if (!url.includes('//'))
  {
    url = 'http://' + url;
  }
  return url;
}

function urlsFor(id)
{
  const userURLs = {};

  for (url in urlDatabase)
  {
    if (urlDatabase[url].userID == id)
    {
      userURLs[url] = { longURL: urlDatabase[url].longURL };
    }
  }
  return userURLs;
}

app.post('/urls/:shortURL/delete', (req, res) =>
  {
    const shortURL = req.params.shortURL;

    if (!req.session.userID)
    {
      res.status(401).send("401 Error: You are not logged in.<p><a href='/'>Return to main page</a></p>")
    }
    else if (req.session.userID !== urlDatabase[shortURL].userID)
    {
      res.status(403).send("403 Error: You do not have access to this page.<p><a href='/'>Return to main page</a></p>")
    }
    else
    {
      delete urlDatabase[shortURL];
    }
    res.redirect('/urls');
  });

app.get('/urls/new', (req, res) =>
  {
    let templateVars = { user: users[req.session.userID] };
    res.render('urls_new', templateVars);
  });

app.get('/u/:shortURL', (req, res) =>
  {
    if (!urlDatabase[req.params.shortURL])
    {
      res.status(400).send("400 Error: Requested TinyURL does not exist.<p><a href='/'>Return to main page</a></p>")
    }
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });

app.post('/urls/:shortURL', (req, res) =>
  {
    const shortURL = req.params.shortURL;

    if (!req.session.userID)
    {
      res.status(401).send("401 Error: You are not logged in.<p><a href='/'>Return to main page</a></p>")
    }
    else if (req.session.userID !== urlDatabase[shortURL].userID)
    {
      res.status(403).send("403 Error: You do not have access to this page.<p><a href='/'>Return to main page</a></p>")
    }
    else
    {
      let longURL = checkHTTP(req.body.newLongURL);
      urlDatabase[shortURL].longURL = longURL;
      res.redirect(`/urls`);
    }
  });

app.get('/urls/:shortURL', (req, res) =>
  {
    const shortURL = req.params.shortURL;
    if (!urlDatabase[req.params.shortURL])
    {
      res.status(400).send("400 Error: Requested TinyURL does not exist.<p><a href='/'>Return to main page</a></p>")
    }
    else if (req.session.userID !== urlDatabase[shortURL].userID)
    {
      res.status(401).send("401 Error: You do not have access to this page.<p><a href='/'>Return to main page</a></p>")
    }
    else
    {
      const templateVars = { shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userID] };
      res.render('urls_show', templateVars);
    }
  });

app.get('/urls.json', (req, res) =>
  {
    res.json(urlDatabase);
  });

app.get('/urls', (req, res) =>
  {
    if (!req.session.userID)
    {
      res.redirect('/login');
    }
    else
    {
      const userID = req.session.userID;
      const templateVars = { urls: urlsFor(userID), user: users[userID] };
      res.render('urls_index', templateVars);
    }
  });

app.post('/urls', (req, res) =>
  {
    if (!req.session.userID)
    {
      res.status(401).send("401 Error: You are not logged in.<p><a href='/'>Return to main page</a></p>")
    }
    let longURL = checkHTTP(req.body.longURL);
    const randString = generateRandomString();

    urlDatabase[randString] =
    {
      longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${randString}`);
    res.end();
  });

app.get('/register', (req, res) =>
  {
    if (req.session.userID)
    {
      res.redirect("/urls");
    }
    else
    {
      const templateVars = { user: users[req.session.userID] };
      res.render('register', templateVars);
    }
  });

app.post('/register', (req, res) =>
  {
    if (req.body.email === '' || req.body.password === '')
    {
      res.status(400).send("Please fill in an email and password to register. <p><a href='/register'>Try again</a></p>");
    }
    else if (emailFound(req.body.email))
    {
      res.status(400).send("That email is already taken! <p><a href='/register'>Try again</a></p>");
    }
    else
    {
      const user =
      {
        id: generateRandomString(),
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      users[user.id] = user;
      req.session.userID = user.id;
      res.redirect('/urls');
    }
  });

app.post('/logout', (req, res) =>
  {
    req.session = null;
    res.redirect('/login')
  });

app.get('/login', (req, res) =>
  {
    if (req.session.userID)
    {
      res.redirect("/urls")
    }
    else
    {
      const templateVars = { user: users[req.session.userID] };
      res.render('login', templateVars);
    }
  })

app.post('/login', (req, res) =>
  {
    const user = emailFound(req.body.email);
    if (req.body.email === '' || req.body.password === '')
    {
      res.status(400).send("Please fill in an email and password to login: <p><a href='/login'>Try again</a></p>");
    }
    else if (!user || !bcrypt.compareSync(req.body.password, user.password))
    {
      res.status(403).send("Incorrect email or password. <p><a href='/login'>Try again</a></p>");
    }
    else
    {
      req.session.userID = user.id;
      res.redirect('/urls');
    }
  });

app.get('/', (req, res) =>
  {
    console.log("ID:", req.session.userID);
    if (req.session.userID)
    {
      res.redirect('/urls');
    }
    else
    {
      res.redirect('/login');
    }
  })

app.listen(PORT, () =>
  {
    console.log(`Example app listening on port ${PORT}!`);
  });