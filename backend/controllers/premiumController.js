const Razorpay = require("razorpay");
const Order = require("../models/orders");
const User = require("../models/user");
const Expense = require("../models/expense");

const sequelize = require("../config/database");
const s3Services = require("../services/awsS3Services");
const ReportHistory = require("../models/reportHistroy");
const { where } = require("sequelize");

let rzp;
try {
  rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error("Failed to initialize Razorpay:", error);
  console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
  console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
}

exports.purchasePremium = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!rzp) {
      throw new Error("Razorpay is not initialized");
    }

    const options = {
      amount: 10000,
      currency: "INR",
    };

    const order = await rzp.orders.create(options);

    const createdOrder = await Order.create(
      {
        orderId: order.id,
        status: "PENDING",
        userId: req.user.id,
      },
      { transaction }
    );

    console.log(`Order created: ${JSON.stringify(createdOrder)}`);
    await transaction.commit();
    res.json({
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in purchasePremium:", error);
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  const userId = req.user.id;
  const transaction = await sequelize.transaction();
  const { order_id, payment_id } = req.body;

  try {
    const order = await Order.findOne({
      where: { orderId: order_id, userId: userId },
      transaction,
    });

    if (!order) {
      throw new Error(
        `Order not found for orderId: ${order_id} and userId: ${userId}`
      );
    }

    await Promise.all([
      order.update(
        { paymentId: payment_id, status: "SUCCESSFUL" },
        { transaction }
      ),
      User.update({ isPremium: true }, { where: { id: userId }, transaction }),
    ]);
    console.log(
      `Transaction successful for orderId: ${order_id}, userId: ${userId}`
    );
    await transaction.commit();
    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error(
      `Transaction failed for orderId: ${order_id}, userId: ${userId}`,
      error
    );
    res.status(500).json({ error: err, message: "transaction update failed" });
  }
};

exports.download = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.findAll({
      where: { userId: userId },
      order: [["date", "DESC"]],
      limit: 10,
    });
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expenses_${userId}_${new Date()}.txt`;
    const fileUrl = await s3Services.uploadToS3(stringifiedExpenses, filename);

    console.log("%%%%%%%%%%%%%%%%%%%%%");
    const reportHistory = await ReportHistory.create({
      fileUrl: fileUrl,
      userId: userId,
    });

    console.log("&&&&&&&&&&&&&&&&");
    console.log("Report history created:", reportHistory.id);

    res.status(200).json(fileUrl);
  } catch (err) {
    console.log("GET DOWNLOAD EXPENSES ERROR");
    res
      .status(500)
      .json({ error: err, message: "Could not get download link" });
  }
};

exports.getReportHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await ReportHistory.findAll({ where: { userId } });

    res.status(200).json(reports.reverse().slice(0, 10));
  } catch (err) {
    console.error("Error generating history");
    res.status(500).json({ error: err, message: "Couldn't load history" });
  }
};
