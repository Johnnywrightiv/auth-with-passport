const express = require("express");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const jwt = require("jwt-simple");

const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());


const tokenForUser = function (user) {
  return jwt.encode(
    // this is the JWT payload
    {
      sub: user.myID,
      iat: Math.round(Date.now() / 1000),
      exp: Math.round(Date.now() / 1000 + 5 * 60 * 60),
    },
    // encrypt / decrtpy key
    "bananas"
    );
  };
  
  // Passport Login Strategy
  passport.use(
    "login",
    new LocalStrategy(function (username, password, done) {
      const authenticated = username === "John" && password === "Smith";
      // console.log("This logs first");
      
      if (authenticated) {
        return done(null, { myUser: "user", myID: 1234 });
      } else {
        return done(null, false);
      }
    })
    );
    
    
    const jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // encrypt / decrtpy key
      secretOrKey: "bananas",
    };
    
    // Passport JWT (protected route) Strategy
    passport.use(
      "jwt",
      new JwtStrategy(jwtOptions, function (payload, done) {
        return done(null, { myUser: "user", myID: payload.sub });
      })
    );
    

    // Login route middleware function
    const requireSignin = passport.authenticate("login", { session: false });
    
    
    app.post("/login", requireSignin, function (req, res, next) {
      // This is where the login process will happen
      // console.log("Then this logs");
      res.send({
        // passport gets req.user from the return statement of the LocalStrategy (here it is the user object {myUser, myID})
        token: tokenForUser(req.user),
      });
    });
    
    app.get("/login", function (req, res) {
      // This route serves the HTML to the browser
      res.sendFile(__dirname + "/login.html");
    });
    
    
    
    const requireAuth = passport.authenticate("jwt", { session: false });
    
    app.get("/protected", requireAuth, function (req, res) {
      // This route will be secured to only logged in users eventually
      res.send("Access Granted!");
    });

    app.listen(8000);
    