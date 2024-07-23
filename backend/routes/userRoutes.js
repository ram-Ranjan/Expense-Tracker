const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middlewares/auth");

const userController = require("../controllers/userController");

router.post("/signup", userController.signupUser);

router.post("/login", userController.loginUser);

router.get(
  "/premiumStatus",
  authenticateJWT,
  userController.checkPremiumStatus
);

module.exports = router;
