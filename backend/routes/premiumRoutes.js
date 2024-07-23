const express = require("express");
const router = express.Router();

const premiumController = require("../controllers/premiumController");
const { authenticateJWT } = require("../middlewares/auth");

router.get("/buyPremium", 
  authenticateJWT, 
  premiumController.purchasePremium);

router.post(
  "/updateTransactionStatus",
  authenticateJWT,
  premiumController.updateTransactionStatus
);

router.get("/download",
  authenticateJWT,
  premiumController.download);

  router.get("/reportHistory",
    authenticateJWT,
    premiumController.getReportHistory)

module.exports = router;
