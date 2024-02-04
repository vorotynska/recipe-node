const User = require("../models/user");
const passport = require("passport");
const {
    body,
    validationResult
} = require("express-validator");

const getUserParams = body => {
    return {
        name: {
            first: body.first,
            last: body.last
        },
        email: body.email,
        password: body.password,
        zipCode: body.zipCode
    };
};


module.exports = {
    index: (req, res, next) => {
        User.find()
            .then(users => {
                res.locals.users = users;
                next();
            })
            .catch(error => {
                console.log(`Error fetching users: ${error.message}`);
                next(error);
            });
    },
    indexView: (req, res) => {
        res.render("users/index", {
            flashMessages: {
                success: "Loaded all users!"
            }
        });
    },

    validate: [
        body('email')
        .normalizeEmail({
            all_lowercase: true
        })
        .trim()
        .isEmail()
        .withMessage('Email is invalid'),

        body('zipCode')
        .notEmpty().withMessage('Zip code cannot be empty')
        .isInt().withMessage('Zip code must be a number')
        .isLength({
            min: 5,
            max: 5
        }).withMessage('Zip code must be 5 digits'),
        // .equals(req.body.zipCode).withMessage('Zip code does not match'),

        body('password')
        .notEmpty()
        .withMessage('Password cannot be empty'),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const messages = errors.array().map(e => e.msg);
                req.skip = true;
                req.flash('error', messages.join(' and '));
                res.locals.redirect = '/users/new';
                next();
            } else {
                next();
            }
        }
    ],

    login: (req, res) => {
        res.render("users/login");
    },
    /*
      authenticate: (req, res, next) => {
          User.findOne({
                  email: req.body.email
              })
              .then(user => {
                  if (user) {
                      user.passwordComparison(req.body.password)
                          .then(passwordsMatch => {
                              if (passwordsMatch) {
                                  res.locals.redirect = `/users/${user._id}`;
                                  req.flash("success", `${user.fullName}'s logged in
         successfully!`);
                                  res.locals.user = user;
                              } else {
                                  req.flash("error", "Failed to log in user account: Incorrect Password.");
                                  res.locals.redirect = "/users/login";
                              }
                              next();
                          });
                  } else {
                      req.flash("error", "Failed to log in user account: User account not found.");
                      res.locals.redirect = "/users/login";
                      next();
                  }
              })
              .catch(error => {
                  console.log(`Error logging in user: ${error.message}`);
                  next(error);
              });
      },  
*/
    authenticate: passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: "Failed to login.",
        successRedirect: "/",
        successFlash: "Logged in!"
    }),
    /*
        authenticate: (req, res, next) => {
            console.log("Request reached the authentication route");
            console.log(req.body); // Посмотрите, что у вас в теле запроса
            passport.authenticate("local", {
                failureRedirect: "/users/login",
                failureFlash: "Failed to login.",
                successRedirect: "/",
                successFlash: "Logged in!"
            })(req, res, next);
        }, */
    /*
       authenticate: (req, res, next) => {
           passport.authenticate("local", (err, user, info) => {
               console.log("Authentication info:", info);
               if (err) {
                   console.error(err);
                   return next(err);
               }
               if (!user) {
                   console.error("Authentication failed:", info.message);
                   req.flash("error", info.message);
                   return res.redirect("/users/login");
               }
               req.logIn(user, err => {
                   if (err) {
                       console.error(err);
                       return next(err);
                   }
                   return res.redirect("/");
               });
           })(req, res, next);
       },
    */

    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
        });
        req.flash("success", "You have been logged out!");
        res.locals.redirect = "/";
        next();
    },

    new: (req, res) => {
        res.render("users/new");
    },

    create: (req, res, next) => {
        if (req.skip) return next();

        let newUser = new User(getUserParams(req.body));

        User.register(newUser, req.body.password, (error, user) => {
            if (user) {
                req.flash("success", `${user.fullName}'s account created
       successfully!`);
                res.locals.redirect = "/users";
                next();
            } else {
                req.flash("error", `Failed to create user account because:
       ${error.message}.`);
                res.locals.redirect = "/users/new";
                next();
            }
        });
    },

    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },
    show: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .then(user => {
                res.locals.user = user;
                next();
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },

    showView: (req, res) => {
        res.render("users/show");
    },

    edit: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .then(user => {
                res.render("users/edit", {
                    user: user
                });
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },

    update: (req, res, next) => {
        let userId = req.params.id,
            userParams = {
                name: {
                    first: req.body.first,
                    last: req.body.last
                },
                email: req.body.email,
                password: req.body.password,
                zipCode: req.body.zipCode
            };
        console.log(userParams);
        User.findByIdAndUpdate(userId, {
                $set: userParams
            }, {
                new: true
            })
            .then(user => {
                res.locals.redirect = `/users/${userId}`;
                res.locals.user = user;
                next();
                console.log(user)
            })
            .catch(error => {
                console.log(`Error updating user by ID: ${error.message}`);
                next(error);
            });
    },

    delete: (req, res, next) => {
        let userId = req.params.id;
        console.log(userId);
        User.findByIdAndDelete(userId)
            .then(() => {
                res.locals.redirect = "/users";
                next();
            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
                next(error);
            });
    }
};