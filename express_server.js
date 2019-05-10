const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));
app.use(morgan('dev'));

const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {};
const users = {};

//////////HELPER FUNCTIONS//////////

function generateRandomString()
{
  let result = '';
  const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  //Select six random chars from the string above, concatenate them, and return them
  for (let i = 0; i < 6; i++)
  {
     result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

//Returns an email from the database if valid; if it is not in the database, returns false
function emailFound(email)
{
  for (let user in users)
  {
    if (users[user].email === email) return users[user];
  }
  return false;
}

//Appends 'http://' to the beginning of a URL if it doesn't already have a protocol
function checkHTTP(url)
{
  if (!url.includes('//'))
  {
    url = 'http://' + url;
  }
  return url;
}

//Returns every URL created by a specific user
function urlsBy(id)
{
  const userURLs = {};

  for (let url in urlDatabase)
  {
    if (urlDatabase[url].userID == id)
    {
      userURLs[url] = { longURL: urlDatabase[url].longURL };
    }
  }
  return userURLs;
}

//////////HELPER FUNCTIONS END//////////

//Deletes a URL
app.post('/urls/:shortURL/delete', (req, res) =>
  {
    const shortURL = req.params.shortURL;

    //Check if user has appropriate cookies
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

//Gets page to create a new URL
app.get('/urls/new', (req, res) =>
  {
    let templateVars = { user: users[req.session.userID] };
    res.render('urls_new', templateVars);
  });

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

//Edits a shortURL
app.post('/urls/:shortURL', (req, res) =>
  {
    const shortURL = req.params.shortURL;

    //Check if user has appropriate cookies
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
      //Set the longURL to the new value from the request body
      urlDatabase[shortURL].longURL = checkHTTP(req.body.newLongURL);
      res.redirect(`/urls`);
    }
  });

//Displays the page for a shortURL
app.get('/urls/:shortURL', (req, res) =>
  {
    const shortURL = req.params.shortURL;

    if (!urlDatabase[shortURL])
    {
      res.status(400).send("400 Error: Requested TinyURL does not exist.<p><a href='/'>Return to main page</a></p>")
    }
    //Check if user has appropriate cookies
    else if (req.session.userID !== urlDatabase[shortURL].userID)
    {
      res.status(401).send("401 Error: You do not have access to this page.<p><a href='/'>Return to main page</a></p>")
    }
    else
    {
      const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user: users[req.session.userID] };
      res.render('urls_show', templateVars);
    }
  });

//Displays every URL the user has created
app.get('/urls', (req, res) =>
  {
    const userID = req.session.userID;

    //Check if user has appropriate cookies
    if (!userID)
    {
      res.redirect('/login');
    }
    else
    {
      const templateVars = { urls: urlsBy(userID), user: users[userID] };
      res.render('urls_index', templateVars);
    }
  });

//Creates a new TinyURL
app.post('/urls', (req, res) =>
  {
    //Check if user has appropriate cookies
    if (!req.session.userID)
    {
      res.status(401).send("401 Error: You are not logged in.<p><a href='/'>Return to main page</a></p>")
    }

    //Append 'http://' to beginning of URL if protocol is not present
    const longURL = checkHTTP(req.body.longURL);
    const randString = generateRandomString();

    //Set the longURL and the creator to a string that forms part of the TinyURL path
    urlDatabase[randString] =
    {
      longURL,
      userID: req.session.userID
    };

    res.redirect(`/urls/${randString}`);
  });

//Dispaly the register page
app.get('/register', (req, res) =>
  {
    const userID = req.session.userID;

    //Check if user does not already have ID cookie
    if (userID)
    {
      res.redirect("/urls");
    }
    else
    {
      const templateVars = { user: users[userID] };
      res.render('register', templateVars);
    }
  });

//Register a new account
app.post('/register', (req, res) =>
  {
    const email = req.body.email;
    const password = req.body.password;

    if (email === '' || password === '')
    {
      res.status(400).send("Please fill in an email and password to register. <p><a href='/register'>Try again</a></p>");
    }
    else if (emailFound(email))
    {
      res.status(400).send("That email is already taken! <p><a href='/register'>Try again</a></p>");
    }
    else
    {
      //Create a new user object with a random ID
      const user =
      {
        id: generateRandomString(),
        email,
        password: bcrypt.hashSync(password, 10)
      };

      //Add user object to users database
      users[user.id] = user;
      req.session.userID = user.id;
      res.redirect('/urls');
    }
  });

//Logs out
app.post('/logout', (req, res) =>
  {
    req.session = null;
    res.redirect('/login')
  });

//Gets login page
app.get('/login', (req, res) =>
  {
    const userID = req.session.userID;

    //Check if user does not already have ID cookie
    if (userID)
    {
      res.redirect("/urls")
    }
    else
    {
      const templateVars = { user: users[userID] };
      res.render('login', templateVars);
    }
  })

//Logs user in
app.post('/login', (req, res) =>
  {
    const email = req.body.email;
    const password = req.body.password;

    //If email exists in database, get the user object the email belongs to
    //If not, user is set to false
    const user = emailFound(email);

    if (email === '' || password === '')
    {
      res.status(400).send("Please fill in an email and password to login: <p><a href='/login'>Try again</a></p>");
    }
    //Check if the user exists and the password is correct
    else if (!user || !bcrypt.compareSync(password, user.password))
    {
      res.status(403).send("Incorrect email or password. <p><a href='/login'>Try again</a></p>");
    }
    else
    {
      //Set the userID cookie
      req.session.userID = user.id;
      res.redirect('/urls');
    }
  });

app.get('/', (req, res) =>
  {
    //Redirect to either /urls (if user has ID cookie) or /login (if user does not have cookie)
    if (req.session.userID) res.redirect('/urls');

    else res.redirect('/login');
  })

app.listen(PORT, () =>
  {
    console.log(`Example app listening on port ${PORT}!`);
  });