const express = require("express");

const layouts = require("express-ejs-layouts")
const app = express();
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const path = require("path");
require('dotenv').config();
const methodOverride = require("method-override");
const passport = require("passport");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");
const {
    body,
    validationResult
} = require("express-validator");
//const router = express.Router()
const router = require("./routes/index");
const errorController = require("./controllers/errorController");
const User = require("./models/user");

app.set("port", process.env.PORT || 3000);

mongoose.connect(process.env.DB, {
    //  useNewUrlParser: true,
    // useUnifiedTopology: true
});

mongoose.connection.on("error", err => {
    console.error("MongoDB connection error:", err);
});

app.use(
    express.urlencoded({
        extended: false
    })
);
app.use(express.json());

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(layouts);
//app.use("/", router);

app.use(methodOverride("_method", {
    method: ["POST", "GET"]
}))

app.use(cookieParser("secret_passcode"));
app.use(expressSession({
    secret: "secret_passcode",
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
//passport.serializeUser(User.serializeUser);
//passport.deserializeUser(User.deserializeUser);
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    };
});


app.use(connectFlash());
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

app.use("/", router);
app.get("/", (req, res) => {
    res.render("index");
});

app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);


const server = app.listen(app.get("port"), () => {
        console.log(
            `Server running at http://localhost:${app.get(
      "port"
    )}`
        );
    }),
    io = require("socket.io")(server);

require("./controllers/ChatController ")(io);