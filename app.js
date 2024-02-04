const express = require("express");
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
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

const User = require("./models/user");
const subscribersController = require("./controllers/subscribeController");
const usersController = require("./controllers/usersController");
const router = express.Router()

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

app.use("/", router);

router.use(methodOverride("_method", {
    method: ["POST", "GET"]
}))

router.use(cookieParser("secret_passcode"));
router.use(expressSession({
    secret: "secret_passcode",
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());
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


router.use(connectFlash());
router.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.send("Welcome to Confetti Cuisine!");
});

app.get("/courses", homeController.showCourses);
app.get("/contact", homeController.showSignUp);
app.post("/contact", homeController.postedSignUpForm);

router.get("/users", usersController.index, usersController.indexView);

router.get("/users/login", usersController.login);
router.post("/users/login", usersController.authenticate);
router.get("/users/logout", usersController.logout, usersController.redirectView);

router.get("/users/new", usersController.new);
router.post("/users/create", usersController.validate, usersController.create,
    usersController.redirectView);
router.get("/users/:id", usersController.show, usersController.showView);
router.get("/users/:id/edit", usersController.edit);
router.put("/users/:id/update", usersController.validate, usersController.update,
    usersController.redirectView);
router.delete("/users/:id/delete", usersController.delete, usersController.redirectView);

router.get("/subscribers", subscribersController.index,
    subscribersController.indexView);
router.get("/subscribers/new", subscribersController.new);
router.post("/subscribers/create", subscribersController.create,
    subscribersController.redirectView);
router.get("/subscribers/:id", subscribersController.show,
    subscribersController.showView);
router.get("/subscribers/:id/edit", subscribersController.edit);
router.put("/subscribers/:id/update", subscribersController.update,
    subscribersController.redirectView);
router.delete("/subscribers/:id/delete",
    subscribersController.delete,
    subscribersController.redirectView);

app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

app.listen(app.get("port"), () => {
    console.log(
        `Server running at http://localhost:${app.get(
      "port"
    )}`
    );
});