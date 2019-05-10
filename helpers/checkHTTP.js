//Appends 'http://' to the beginning of a URL if it doesn't already have a protocol
function checkHTTP(url)
{
  if (!url.includes('//'))
  {
    url = 'http://' + url;
  }
  return url;
}

module.exports = checkHTTP;