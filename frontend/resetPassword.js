const base_url = "http://localhost:3000/api";
const urlParams = new URLSearchParams(window.location.search);

document.getElementById("resetForm").addEventListener("submit",async (event) => {
  event.preventDefault();

  const resetId = urlParams.get("resetId");
  const error = document.querySelector(".error");
  error.style.color = "red";
  error.textContent = "";

  let valid = true;
  //Validate Password
  const password = document.getElementById("password").value.trim();
  if (password.length < 8) {
    document.getElementById("passwordError").textContent =
      "Password must be atleast 8 characters long";
    valid = false;
    return;
  }
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();
  if (password !== confirmPassword) {
    document.getElementById("passwordError").textContent =
      "password mismatch!!";
    valid = false;
    return;
  }

  try{
        const response = await axios
        .post(`${base_url}/password/resetPassword/${resetId}`, { password })

        alert("Password Reset Successful");
        window.location.href = "login.html";
  }
  catch(err){
        const errorMessage =
          err.response?.data?.error || "An unknown error occurred";
        alert("Password reset Failed: " + errorMessage);
  }
});
