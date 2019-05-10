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

module.exports = generateRandomString;