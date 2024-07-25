const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");
const { authenticateJWT } = require("../middlewares/auth");

router.post("/addExpense", authenticateJWT, expenseController.addExpense);
router.get("/", authenticateJWT, expenseController.getAllExpenses);
router.get("/:expenseId", authenticateJWT, expenseController.getExpense);
router.put("/:expenseId", authenticateJWT, expenseController.updateExpense);
router.delete("/:expenseId", authenticateJWT, expenseController.deleteExpense);


router.get(
  "/premium/leaderboard",
  authenticateJWT,
  expenseController.getLeaderBoard
);


 

module.exports = router;
