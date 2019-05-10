//Returns an email from the database if valid; if it is not in the database, returns false
function emailFound(email, users)
{
  for (let user in users)
  {
    if (users[user].email === email) return users[user];
  }
  return false;
}

module.exports = emailFound;