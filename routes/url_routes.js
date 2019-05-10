const express = require('express');
const checkHTTP = require('../helpers/checkHTTP.js');
const generateRandomString = require('../helpers/generateRandomString.js');
const urlsBy = require('../helpers/urlsBy.js');
const { urlDatabase, userDatabase } = require('../databases.js');

const router = express();

//Deletes a URL
router.post('/:shortURL/delete', (req, res) =>
  {
    const shortURL = req.params.shortURL;
    console.log("URL Database (Delete):", urlDatabase);
    console.log("ShortURL (Delete):", shortURL);

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
router.get('/new', (req, res) =>
  {
    let templateVars = { user: userDatabase[req.session.userID] };
    res.render('urls_new', templateVars);
  });

//Edits a shortURL
router.post('/:shortURL', (req, res) =>
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
router.get('/:shortURL', (req, res) =>
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
      const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user: userDatabase[req.session.userID] };
      res.render('urls_show', templateVars);
    }
  });

//Displays every URL the user has created
router.get('/', (req, res) =>
  {
    console.log('our database:', urlDatabase)
    const userID = req.session.userID;
    console.log("userID:", userID);

    //Check if user has appropriate cookies
    if (!userID)
    {
      res.redirect('/login');
    }
    else
    {
      const templateVars = { urls: urlsBy(userID, urlDatabase), user: userDatabase[userID] };
      console.log("Vars passed to GET /urls:", templateVars.urls);
      res.render('urls_index', templateVars);
    }
  });

//Creates a new TinyURL
router.post('/', (req, res) =>
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
      longURL: longURL,
      userID: req.session.userID
    };
    console.log("urlDatabase called by POST /url:", urlDatabase);
    console.log("Posted TinyURL:", urlDatabase[randString]);

    res.redirect(`/urls/${randString}`);
});

module.exports = router;