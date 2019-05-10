const express = require('express');
const emailFound = require('../helpers/emailFound.js');
const generateRandomString = require('../helpers/generateRandomString.js');
const bcrypt = require('bcrypt');
const { userDatabase } = require('../databases.js');

const router = express();

//Display the register page
router.get('/register', (req, res) =>
  {
    const userID = req.session.userID;

    //Check if user does not already have ID cookie
    if (userID)
    {
      res.redirect("/urls");
    }
    else
    {
      const templateVars = { user: userDatabase[userID] };
      res.render('register', templateVars);
    }
  });

//Register a new account
router.post('/register', (req, res) =>
  {
    const email = req.body.email;
    const password = req.body.password;

    if (email === '' || password === '')
    {
      res.status(400).send("Please fill in an email and password to register. <p><a href='/register'>Try again</a></p>");
    }
    else if (emailFound(email, userDatabase))
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

      //Add user object to userDatabase database
      userDatabase[user.id] = user;
      req.session.userID = user.id;
      res.redirect('/urls');
    }
  });

//Logs out
router.post('/logout', (req, res) =>
  {
    req.session = null;
    res.redirect('/login')
  });

//Gets login page
router.get('/login', (req, res) =>
  {
    const userID = req.session.userID;

    //Check if user does not already have ID cookie
    if (userID)
    {
      res.redirect("/urls")
    }
    else
    {
      const templateVars = { user: userDatabase[userID] };
      res.render('login', templateVars);
    }
  })

//Logs user in
router.post('/login', (req, res) =>
  {
    const email = req.body.email;
    const password = req.body.password;

    //If email exists in database, get the user object the email belongs to
    //If not, user is set to false
    const user = emailFound(email, userDatabase);

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

//Directs to either /urls or /login depending on whether user is logged in
router.get('', (req, res) =>
  {
    //Redirect to either /urls (if user has ID cookie) or /login (if user does not have cookie)
    if (req.session.userID) res.redirect('/urls');

    else res.redirect('/login');
  })

module.exports = router;