#Task 14-ForgotPassword Mail Integration

#overview
Mail integration using Bravo(formaly sendBlueMail)

##steps
1. Installation - ``` npm i sbm-


// Frontend (forgetPassword.js)
const base_url = "http://localhost:3000/api";
document.getElementById('resendPasswordForm').addEventListener('submit', (event) => {
    const email = document.getElementById('email').value; // Get the email value
    axios.post(`${base_url}/password/forgetPassword`, { email: email })
        .then(response => {
            console.log(response);
            alert('If the email exists in our system, you will receive a password reset link shortly.');
        })
});

// Backend (passwordController.js)
const Sib = require('sib-api-v3-sdk');
exports.forgetPassword = async (req, res) => {
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.MAIL_KEY;

    const tranEmailApi = new Sib.TransactionalEmailsApi();
    const { email } = req.body; // Destructure email from req.body
    try {
        const user = await User.findOne({
            where: { email: email }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate a unique token for password reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const sender = {
            email: 'rapranjan@gmail.com'
        };
        const receivers = [{
            email: email
        }];
        await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: "Password Reset Request",
            htmlContent: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p> `
        });
        res.status(200).json({ message: 'Password reset email sent
};


Task-17 -Report Generation Backend-
Using S3 to upload and download generated report

Frontend
