const ForgotPasswordRequest = require("../models/forgotPasswordRequests");
const Sib = require("sib-api-v3-sdk");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");

exports.forgotPassword = async (req, res) => {
  const client = Sib.ApiClient.instance;
  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.MAIL_KEY;

  const tranEmailApi = new Sib.TransactionalEmailsApi();
  const { email } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: { email: email },
      transaction,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetId = uuidv4();
    await ForgotPasswordRequest.create(
      {
        id: resetId,
        userId: user.id,
        isActive: true,
      },
      { transaction }
    );

    const resetUrl = `http://localhost:3000/api/password/resetPassword/${resetId}`;

    const sender = {
      email: "rapranjan@gmail.com",
    };

    const receivers = [
      {
        email: email,
      },
    ];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Forgot password! No worries we have you covered",
      htmlContent: `
            <h1>Password Reset</h1>
            <p>You requested a password reset. </p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 15 minutes.</p>
            `,
    });
    await transaction.commit();
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    await transaction.rollback();
    console.log("Error in forgetPassword:", error);
    res.status(500).json({ message: "An error occured", error: error.message });
  }
};

exports.generateResetForm = async (req, res) => {
  let { resetId } = req.params;
  console.log(resetId);
  try {
    let request = await ForgotPasswordRequest.findOne({
      where: { id: resetId, isActive: true },
    });

    if (!request) {
      return res.status(404).json({ message: "Invalid or Expired reset link" });
    }

    return res.redirect(
      `http://127.0.0.1:5500/frontend/resetPassword.html?resetId=${resetId}`
    );
  } catch (error) {
    console.error("Error checking reset password request:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

exports.resetPassword = async (req, res) => {
  const transaction = await sequelize.transaction();

  const { resetId } = req.params;
  const { password } = req.body;
  try {
    const resetRequest = await ForgotPasswordRequest.findOne({
      where: { id: resetId, isActive: true },
      transaction,
    });

    if (!resetRequest) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }
    const user = await User.findOne({
      where: { id: resetRequest.userId },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({ password: hashedPassword }, { transaction });

    await resetRequest.update({ isActive: false }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "{Password successfully reset" });
  } catch (error) {
    transaction.rollback();
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "An error occurred while resetting the password" });
  }
};
