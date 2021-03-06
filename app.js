const express = require("express");
const app = express();
const static = express.static(__dirname + "/public");
const session = require('express-session');
var bodyParser = require('body-parser');
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.use(
  session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    saveUninitialized: true,
    resave: false
  })
);

app.use((req, res, next) => {
  let currentTime = new Date().toUTCString();
  let method = req.method;
  let route = req.originalUrl;
  if (!req.session.user) {
      console.log("[" + currentTime + "]: " + method + " " + route + " (Non-Authenticated User)");
  } else {

      console.log("[" + currentTime + "]: " + method + " " + route + " (Authenticated User)");
  }
  next();
});

app.use(function(req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

app.use('/signin', (req, res, next) => {

  if (req.session.user) {
    return res.redirect('/home');
  } else {
    req.method = 'POST';
    next();
  }
});


app.use('/home', (req, res, next) => {
  //   console.log(req.session.id)
  if (!req.session.user) {
    return res.status(403).render('differentPages/SignIn',{hasErrors: true, errors: "Error: You are not logged in!! Please Login to proceed further!! "});
  } else {
    next();
  }
});




configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
