//Returns every URL created by a specific user
function urlsBy(id, urlDatabase)
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

module.exports = urlsBy;