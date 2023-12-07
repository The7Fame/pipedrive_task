const express = require("express");
const path = require("path");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth").OAuth2Strategy;

const api = require("./api");
const config = require("./config");
const User = require("./db/user");
const bodyParser = require("body-parser");

User.createTable();

const app = express();
const port = 3000;

passport.use(
  "pipedrive",
  new OAuth2Strategy(
    {
      authorizationURL: "https://oauth.pipedrive.com/oauth/authorize",
      tokenURL: "https://oauth.pipedrive.com/oauth/token",
      clientID: config.clientID || "",
      clientSecret: config.clientSecret || "",
      callbackURL: config.callbackURL || "",
    },
    async (accessToken, refreshToken, profile, done) => {
      const userInfo = await api.getUser(accessToken);
      const user = await User.add(
        userInfo.data.name,
        accessToken,
        refreshToken
      );
      done(null, { user });
    }
  )
);

app.disable("x-powered-by");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(async (req, res, next) => {
  req.user = await User.getById(1);
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/auth/pipedrive", passport.authenticate("pipedrive"));
app.get(
  "/auth/pipedrive/callback",
  passport.authenticate("pipedrive", {
    session: false,
    failureRedirect: "/",
    successRedirect: "/",
  })
);
app.get("/", async (req, res) => {
  if (req.user.length < 1) {
    return res.redirect("/auth/pipedrive");
  }

  try {
    res.render("form");
  } catch (error) {
    return res.send(error.message);
  }
});

app.post("/deal", async (req, res) => {
  try {
    const newJob = await api.addDeal(req.user[0].access_token, {
      title: `Name of job #${Math.floor(Math.random() * 11)}`,
      ...req.body,
    });
    return res.render("created", { id: newJob.data.id });
  } catch (error) {
    console.log(error);
    return res.send(error.message);
  }
});

app.listen(port, () => console.log(`Start server on http://127.0.0.1:${port}`));
