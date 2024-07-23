const express = require("express");

const router = express.Router();

const passwordController = require("../controllers/passwordController");

router.post("/forgotPassword", passwordController.forgotPassword);

router.get("/resetPassword/:resetId", passwordController.generateResetForm);

router.post("/resetPassword/:resetId", passwordController.resetPassword);

module.exports = router;
