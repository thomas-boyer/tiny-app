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
  let result = '';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 6; i++)
  {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
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

app.post('/urls/:shortURL', (req, res) =>
  {
    urlDatabase[req.params.shortURL] = req.body.newLongURL;
    res.redirect(`/urls/${req.params.shortURL}`)
  });

app.get('/urls/:shortURL', (req, res) =>
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
    res.redirect(`/urls/${randString}`);
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