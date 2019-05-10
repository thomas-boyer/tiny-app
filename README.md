# TinyApp Project

TinyApp is a full-stack web app that can shorten URLs and save the results, called TinyURLs, to a database. It also keeps track of the logged-in user and what TinyURLs that user has created. A TinyURL can be modified, but only by the creator of that TinyURL, if they are logged in.

## Final Product

!["The main page, displaying two shortened links"](https://github.com/thomas-boyer/tiny-app/blob/master/docs/urls_index.png)

!["Creating a new link"](https://github.com/thomas-boyer/tiny-app/blob/master/docs/new_url.png)

!["Editing a TinyURL"](https://github.com/thomas-boyer/tiny-app/blob/master/docs/edit_url.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- morgan (for devs)

## Getting Started

- Install all dependencies using the "npm install" command.
- Run the development web server using the "node express_server.js" command.