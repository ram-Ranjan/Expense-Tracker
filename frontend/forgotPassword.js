const base_url = "http://localhost:3000/api";

document.getElementById('resetPasswordForm').
addEventListener('submit',(event) => {
    event.preventDefault();
    const email = event.target.email.value;

axios.post(`${base_url}/password/forgotPassword`,{email:email})//pass an object to be caught by req.body
.then(response => {
    console.log(response)
    alert('If the email exists in our system, you will receive a password reset link shortly.');
})

.catch(err => {
    console.error(err)
            alert('An error occurred. Please try again.');
});

})


