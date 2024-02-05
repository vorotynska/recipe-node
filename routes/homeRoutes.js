var express = require('express');
const router = require("express").Router(),
    homeController = require("../controllers/homeController");

router.get("/courses", homeController.showCourses);
router.get("/contact", homeController.showSignUp);
router.post("/contact", homeController.postedSignUpForm);

module.exports = router