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

Task 19 - Deploying implementations

What are environment variables and what should we use it for?
Environment Variables are the sensitive keys like Database username and password, payment api keys , and other sensitive information that we should give to the server so we store them in .env file and link it to server as use the values using keys to those variables along configuration information about the application.

What all thing should you do to prepare code for production?Explain each one of them and why we need it?
We should keep several things in mind before going live for production:- One of them we just discussed that are environment variables, proper loggin for example using morgan , proper headers example using helmet, compressing files that need to be rendered and our whole codebase should have proper naming conventions and optimization, error handling, and security measures.


Why should we put the port number and mongodb connection string in env variable?
for security,flexiblity,and scalability.

What is process variable?What does process.env do?
process object is a global that provides information and control over current NodeJs app process. process.env returns an object containing the user environment. It allow to access the environment varible.


What are the key security things which helmet provides. Can you explain a few?
Helmet helps secure express apps by setting various http headers.
x-xss-protection,prevents mime type sniffing, enforces secure connection to the server,etc and provides Content-Security-Policy.

How does the udemy trainer configure morgan? Can you explain the flow and what logs will morgan provide
first we need to install morgan and then add it to out server
after that,
const accessLogFiles= fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})
app.use(morgan('combined',{stream:accessLogFiles}))

Morgon is http request logger for nodejs which logs http method, url, status code, response time etc.

