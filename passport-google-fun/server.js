const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const User = require("./user");

const app = express();

mongoose.connect("mongodb://localhost/google-passport-fun", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: ["helloworld"],
  })
);

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    console.log(id);
    done(null, user);
  });
});


passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: "641217094177-ot1fejf3hcrukpkhpqcumm782sthkc98.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("access token --->", accessToken);
      console.log("refresh token --->", refreshToken);
      console.log("profile --->", profile);
      User.findOne({ googleId: profile.id }).then((existingUser) => {
        if (existingUser) {
          // we already have a record with the given profile ID
          done(null, existingUser);
        } else {
          // we don't have a user record with this ID, make a new record!
          new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
            .save()
            .then((user) => done(null, user));
        }
      });
    }
  )
);

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

app.get("/auth/google", googleAuth);

app.get("/auth/google/callback", googleAuth, (req, res) => {
  res.send("You are logged in via Google!");
});

app.get("/api/current_user", (req, res) => {
  res.send(req.user);
});

app.get("/api/logout", (req, res) => {
  req.logout();
  res.send(req.user);
});

app.listen(3000);