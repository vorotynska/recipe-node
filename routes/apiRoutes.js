/*const router = require("express").Router(),
    coursesController =
    require("../controllers/courseController");

router.get("/courses", coursesController.index,
    coursesController.respondJSON);
router.use(coursesController.errorJSON);

router.get("/courses/:id/join", coursesController.join,
    coursesController.respondJSON);

router.get("/courses", coursesController.index,
    coursesController.filterUserCourses, coursesController.respondJSON);

module.exports = router; */

const router = require("express").Router(),
    coursesController = require("../controllers/courseController");

router.get("/courses", coursesController.index,
    coursesController.filterUserCourses,
    coursesController.respondJSON);
router.get("/courses/:id/join", coursesController.join,
    coursesController.respondJSON);
router.use(coursesController.errorJSON);

module.exports = router;