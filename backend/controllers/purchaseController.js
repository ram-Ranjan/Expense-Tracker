const Razorpay = require("razorpay");
const Order = require("../models/orders");
const User = require("../models/user");

const sequelize = require("../config/database");

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
  try {
    if (!rzp) {
      throw new Error("Razorpay is not initialized");
    }

    const options = {
      amount: 100,
      currency: "INR",
    };

    const order = await rzp.orders.create(options);

    const createdOrder = await Order.create({
      orderId: order.id,
      status: "PENDING",
      userId: req.user.id,
    });

    console.log(`Order created: ${JSON.stringify(createdOrder)}`);

    res.json({
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error in purchasePremium:", error);
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
};

exports.updateTransactionStatus = async (orderId, paymentId) => {
 
    const userId = req.user.id;
    const transaction = await sequelize.transaction();
  try {
    const order = await Order.findOne({
        where: { orderId, UserId: userId },
      transaction }
    );

    if (!order) {
             throw new Error(`Order not found for orderId: ${orderId} and userId: ${userId}`);
      }

      await Promise.all([
        order.update(
          { paymentId, status: "SUCCESSFUL" },
          { transaction }
        ),
        User.update(
          { isPremium: true },
          { where: { id: userId }, transaction }
        )
      ]);
    await transaction.commit();
    console.log(
      `Transaction successful for orderId: ${orderId}, userId: ${userId}`
    );
  } catch (error) {
    await transaction.rollback();
    console.error(`Transaction failed for orderId: ${orderId}, userId: ${userId}`,error);
    throw error;
  }
};

// exports.updateTransaction = async (req, res) => {
//   try {
//     const { order_id, payment_id } = req.body;

//     const userId = req.user.id;
//     if (!order_id || !payment_id) {
//       return res.status(400).json({ error: "Missing order_id or payment_id" });
//     }

//     await updateTransactionStatus(order_id, payment_id, userId);
//     res.status(202).json({ message: "Transaction successful" });
//   } catch (error) {
//     console.error("Error in updateTransaction:", error);
//     res
//       .status(500)
//       .json({ error: "Something went wrong", details: error.message });
//   }
// };
