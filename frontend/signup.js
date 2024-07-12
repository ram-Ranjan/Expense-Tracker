
const base_url ="http://localhost:3000/api"


document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    let valid = true;

    // Validate username
    const username = document.getElementById('username').value.trim();
    if (username.length < 3) {
        document.getElementById('usernameError').textContent = 'Username must be at least 3 characters long';
        valid = false;
    }

    // Validate email
    const email = document.getElementById('email').value.trim();
    if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        valid = false;
    }

    // Validate password
    const password = document.getElementById('password').value;
    if (password.length < 8) {
        document.getElementById('passwordError').textContent = 'Password must be at least 8 characters long';
        valid = false;
    }

    if (valid) {
        // If all validations pass, you can submit the form
        const user ={username,email,password}

        axios.post(`${base_url}/user/signup`,user)
        .then(user => {
            confirm("User Signed Up successfully!");
            console.log('User Signed Up')
            document.getElementById('signupForm').reset();

        })
        .catch(err => 
            { alert("User Sign up Failed:"+err.response.data.error)});
    }
   


});