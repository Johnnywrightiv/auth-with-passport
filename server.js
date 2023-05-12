const express = require("express");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");

const LocalStrategy = require("passport-local").Strategy;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

app.use(passport.session());

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

passport.use(
  "login",
  new LocalStrategy((username, password, done) => {
    const authenticated = username === "John" && password === "Smith";

    if (authenticated) {
      return done(null, { myUser: "user", myID: 1234 });
    } else {
      return done(null, false);
    }
  })
);

const authenticateRequest = function (req, res, next) {
  if (!req.isAuthenticated()) {
    // Denied. Redirect to login
    console.log("DEEEnied");
    res.redirect("/login");
  } else {
    next();
  }
};

app.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/success",
    failureRedirect: "/login",
  })
);

app.get("/success", (req, res) => {
  res.send("Hey, hello from the server!");
});

app.get("/protected", authenticateRequest, (req, res) => {
  res.send("Secret stuff!");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.send("Logged out!");
});

app.listen(8000);