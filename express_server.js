const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase =
{
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString()
{
  let result = "";

  for (let i = 0; i < 6; i++)
  {
    //Declare a number that will correspond to either the digits 0-9
    //or an ASCII character code from A-Z or a-z
    let rand;

    //Generate a random number between 55 and 123
    rand = Math.floor(Math.random() * 68) + 55;
    //If rand is between 55 and 64 inclusive, set it to a digit between 0 and 9
    if (rand <= 64) result += String(rand - 55);
    //Filter out non-alphabetical ASCII codes between A-Z and a-z
    else if (rand >= 91 && rand <= 96) i--;
    //Otherwise, add corresponding ASCII value to returned string
    else result += String.fromCharCode(rand);
  }

  return result;
}

app.post('/urls/:shortURL/delete', (req, res) =>
  {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  });

app.get('/urls/new', (req, res) =>
  {
    res.render('urls_new');
  });

app.get('/u/:shortURL', (req, res) =>
  {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

app.get('/url/:shortURL', (req, res) =>
  {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render('urls_show', templateVars);
  });

app.get('/urls.json', (req, res) =>
  {
    res.json(urlDatabase);
  });

app.get('/urls', (req, res) =>
  {
    const templateVars = { urls: urlDatabase };
    res.render('urls_index', templateVars);
  });

app.post('/urls', (req, res) =>
  {
    const randString = generateRandomString();
    urlDatabase[randString] = req.body.longURL;
    res.redirect(`/url/${randString}`);
    res.end();
  });

app.get('/', (req, res) =>
  {
    res.send('Hello!');
  });

app.get('/hello', (req, res) =>
  {
    res.send('<html><body>Hello <b>World</b></body></html>\n')
  })

app.listen(PORT, () =>
  {
    console.log(`Example app listening on port ${PORT}!`);
  });