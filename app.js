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

app.use("/", router)

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(layouts);

app.get("/", (req, res) => {
    res.send("Welcome to Confetti Cuisine!");

});

app.get("/courses", homeController.showCourses);
//app.get("/contact", homeController.showSignUp);

app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/contact", subscribersController.getSubscriptionPage);
app.post("/subscribe", subscribersController.saveSubscriber);

app.post("/contact", homeController.postedSignUpForm);

app.get("/users", usersController.index, usersController.indexView);

router.get("/users/new", usersController.new);
router.post("/users/create", usersController.create,
    usersController.redirectView);
router.get("/users/:id", usersController.show, usersController.showView);
router.use(methodOverride("_method", {
    method: ["POST", "GET"]
}))

router.get("/users/:id/edit", usersController.edit);
router.put("/users/:id/update", usersController.update,
    usersController.redirectView);

app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

app.listen(app.get("port"), () => {
    console.log(
        `Server running at http://localhost:${app.get(
      "port"
    )}`
    );
});