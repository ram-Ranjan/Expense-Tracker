const base_url = "http://localhost:3000/api";

let currentPage = 1;
let itemsPerPage = 5;

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

function showMessage(message) {
  const messageElement = document.getElementById("message");
  messageElement.textContent = message;
  messageElement.className = "error";
  setTimeout(() => (messageElement.textContent = ""), 3000);
}

document
  .getElementById("expenseForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const transactionType = document.getElementById("transactionType").value;
    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);

    const expense = {
      date,
      category,
      description,
      income: transactionType === "income" ? amount : 0,
      spending: transactionType === "expense" ? amount : 0,
    };

    const expenseId = this.dataset.editId;
    if (expenseId) {
      // Update existing expense
      updateExpense(expenseId, expense);
    } else {
      // Add new expense
      addExpense(expense);
    }
  });

function addExpense(expense) {
  axios
    .post(`${base_url}/expense/addExpense`, expense, getAuthHeader())
    .then(() => {
      document.getElementById("expenseForm").reset();
      fetchExpenses();
      checkPremiumStatus();
      fetchLeaderboard();
    })
    .catch((err) =>
      showMessage(
        `Failed to add expense: ${err.response?.data?.error || err.message}`
      )
    );
}

function updateExpense(expenseId, expense) {
  axios
    .put(`${base_url}/expense/${expenseId}`, expense, getAuthHeader())
    .then((response) => {
      console.log("Server response:", response.data);
      alert("Expense updated successfully!");
      document.getElementById("expenseForm").reset();
      document.getElementById("expenseForm").dataset.editId = "";
      document.querySelector('button[type="submit"]').textContent =
        "Add Expense";
      fetchExpenses();
      checkPremiumStatus();
      fetchLeaderboard();
    })
    .catch((err) =>
      showMessage(
        `Failed to update expense: ${err.response?.data?.error || err.message}`
      )
    );
}

function deleteExpense(expenseId) {
  if (confirm("Are you sure you want to delete this expense?")) {
    if(!expenseId){
      showMessage("Failed to Delete ########### expense details");
    return;
    }
    
    axios
      .delete(`${base_url}/expense/${expenseId}`, getAuthHeader())
      .then((response) => {
        console.log("Server response:", response.data);
        fetchExpenses();
        checkPremiumStatus();
        fetchLeaderboard();
      })
      .catch((err) =>
        showMessage(
          `Failed to delete expense: ${
            err.response?.data?.error || err.message
          }`
        )
      );
  }
}

function fetchExpenses(page = 1, limit = itemsPerPage) {
  axios
    .get(`${base_url}/expense`,{ ...getAuthHeader(),
    params: { page, limit }})
    .then((response) => {
      const expenses = response.data.expenses;
      const expenseList = document.getElementById("expenseList");
      const totalItems = response.data.totalItems;
      expenseList.innerHTML = ""; // Clear existing list

      expenses.forEach((expense) => {
        const row = createExpenseRow(expense);
        expenseList.appendChild(row);
      })
      updatePagination(page, limit, totalItems);

      document
    .querySelectorAll(".edit-btn")
    .forEach((btn) => btn.addEventListener("click", handleEdit));
  document
    .querySelectorAll(".delete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", (e) => deleteExpense(e.target.dataset.id))
    )
   
    
  })
    .catch((err) => {
      console.error("Failed to fetch expenses:", err);
      document.querySelector("main").innerHTML = `
                <h1>404 NOT FOUND</h1><BR><BR>
                <h2>Page Not Found</h2>
                `;
    });
}
function createExpenseRow(expense) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${expense.date}</td>
    <td>${expense.category}</td>
    <td>${expense.description}</td>
    <td>${expense.income}</td>
    <td>${expense.spending}</td>
    <td>
      <button class="edit-btn" data-id="${expense.expenseId}">Edit</button>
      <button class="delete-btn" data-id="${expense.expenseId}">Delete</button>
    </td>
  `;
  return row;
}

function updatePagination(currentPage, limit, totalItems) {
  const totalPages = Math.ceil(totalItems / limit);
  const paginationButtons = document.getElementById("paginationButtons");
  paginationButtons.innerHTML = "";

  // Previous button
  if (currentPage > 1) {
    const prevButton = createPaginationButton("Prev", () =>
      fetchExpenses(currentPage - 1, limit)
    );
    paginationButtons.appendChild(prevButton);
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = createPaginationButton(i.toString(), () =>
      fetchExpenses(i, limit)
    );
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    paginationButtons.appendChild(pageButton);
  }

  // Next button
  if (currentPage < totalPages) {
    const nextButton = createPaginationButton("Next", () =>
      fetchExpenses(currentPage + 1, limit)
    );
    paginationButtons.appendChild(nextButton);
  }
}

function createPaginationButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}



function handleEdit(event) {
  const expenseId = event.target.dataset.id;
  if(!expenseId){
    showMessage("Failed to Edit ########### expense details");
  return;
  }
  axios
    .get(`${base_url}/expense/${expenseId}`, getAuthHeader())
    .then((response) => {
      const expense = response.data;
      const form = document.getElementById("expenseForm");
      form.date.value = expense.date;
      form.category.value = expense.category;
      form.description.value = expense.description;
      form.transactionType.value = expense.income > 0 ? "income" : "expense";
      form.amount.value =
        expense.income > 0 ? expense.income : expense.spending;
      form.dataset.editId = expenseId;
      form.querySelector('button[type="submit"]').textContent =
        "Update Expense";
    })
    .catch((err) => showMessage("Failed to fetch expense details"));
}

document.querySelector(".logout").addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

document
  .querySelector(".rzp-btn")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${base_url}/premium/buyPremium`,
        getAuthHeader()
      );

      if (!response.data || !response.data.key_id || !response.data.order_id) {
        throw new Error("Invalid response from server");
      }

      const options = {
        key: response.data.key_id,
        order_id: response.data.order_id,
        //handler function will handle the successful payment
        handler: async function (response) {
          await axios.post(
            `${base_url}/premium/updateTransactionStatus`,
            {
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id,
            },
            getAuthHeader()
          );

          alert("You are a Premium User Now");
          checkPremiumStatus();
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () =>
        showMessage("Payment failed. Please try again.")
      );
    } catch (error) {
      showMessage("Failed to initiate premium purchase. Please try again.");
    }
  });

function updateUIForPremiumUser() {
  // Hide the 'Become Premium' button
  document.querySelector(".rzp-btn").style.display = "none";

  if (!document.querySelector(".premium-badge")) {
    const premiumBadge = document.createElement("span");
    premiumBadge.textContent = "Premium User";
    premiumBadge.classList.add("premium-badge");
    document.querySelector("header").appendChild(premiumBadge);
  }

  ["leaderboardBtn", "reportBtn"].forEach((btnId) => {
    let btn = document.getElementById(btnId);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = btnId;
      btn.textContent =
        btnId === "leaderboardBtn" ? "Show Leaderboard" : "Show Report History";
      document.querySelector(".list-section").appendChild(btn);
    }
    btn.addEventListener(
      "click",
      btnId === "leaderboardBtn" ? toggleLeaderboard : toggleReport
    );
  });
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.style.display = "block";
  downloadBtn.addEventListener("click", downloadExpenses);
}

function toggleLeaderboard() {
  let leaderboardSection = document.getElementById("leaderboard");
  if (!leaderboardSection || leaderboardSection.style.display === "none") {
    fetchLeaderboard();
  } else {
    leaderboardSection.style.display = "none";
  }
}

function toggleReport() {
  const reportSection = document.getElementById("report");
  if (!reportSection || reportSection.style.display === "none") {
    fetchReportHistory();
  } else {
    reportSection.style.display = "none";
  }
}

function fetchLeaderboard() {
  let leaderboardSection = document.getElementById("leaderboard");
  if (!leaderboardSection) {
    leaderboardSection = document.createElement("div");
    leaderboardSection.id = "leaderboard";
    document.getElementById("premium").appendChild(leaderboardSection);
  }
  leaderboardSection.style.display = "block";
  leaderboardSection.innerHTML = "<p>Loading leaderboard...</p>";

  axios
    .get(`${base_url}/expense/premium/leaderboard`, getAuthHeader())
    .then((response) => {
      leaderboardSection.innerHTML = `<h2>Expense Leaderboard</h2>`;
      const table = document.createElement("table");
      table.innerHTML = `
        <tr>
          <th>Rank</th>
          <th>Name</th> 
          <th>Total Balance</th>
        </tr>`;
      response.data.forEach((entry, index) => {
        const row = table.insertRow();
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${entry.username}</td>
          <td>₹${entry.totalBalance}</td>`;
        if (entry.isCurrentUser) {
          row.classList.add("highlight");
        }
      });
      leaderboardSection.appendChild(table);
    })
    .catch((err) => {
      leaderboardSection.innerHTML =
        "<p>Failed to load leaderboard. Please try again later.</p>";
    });
}

function fetchReportHistory() {
  let reportSection = document.getElementById("report");
  if (!reportSection) {
    reportSection = document.createElement("div");
    reportSection.id = "report";
    document.getElementById("premium").appendChild(reportSection);
  }
  reportSection.style.display = "block";
  reportSection.innerHTML = "<p>Loading report history...</p>";

  axios
    .get(`${base_url}/premium/reportHistory`, getAuthHeader())
    .then((response) => {
      reportSection.innerHTML = "<h2>Report Download History</h2>";
      const table = document.createElement("table");
      table.innerHTML = `
        <tr>
          <th>Date</th>
          <th>File URL</th>
        </tr>
      `;
      response.data.forEach((report) => {
        const row = table.insertRow();
        row.innerHTML = `
          <td>${new Date(report.createdAt).toLocaleString()}</td>
          <td><a href="${report.fileUrl}" target="_blank">Download</a></td>
        `;
      });
      reportSection.appendChild(table);
    })
    .catch(() => {
      reportSection.innerHTML =
        "<p>Failed to load report history. Please try again later.</p>";
    });
}

function downloadExpenses() {
  axios
    .get(`${base_url}/premium/download`, getAuthHeader())
    .then((res) => {
      window.open(res.data, "_blank");
      showMessage("Expense report downloaded successfully!");
    })
    .catch(() => showMessage("Error: Couldn't download expense file!"));
}

function checkPremiumStatus() {
  return axios
    .get(`${base_url}/user/premiumStatus`, getAuthHeader())
    .then((response) => {
      if (response.data.isPremium) {
        updateUIForPremiumUser();
      } else {
        // Ensure premium features are hidden for non-premium users
        document.querySelector(".rzp-btn").style.display = "block";
        document.getElementById("premium").innerHTML = "";
        const premiumBadge = document.querySelector(".premium-badge");
        if (premiumBadge) premiumBadge.remove();
        ["leaderboardBtn", "reportBtn"].forEach((btnId) => {
          const btn = document.getElementById(btnId);
          if (btn) btn.remove();
        });
        document.getElementById("downloadBtn").style.display = "none";
      }
    })
    .catch((error) => console.error("Error checking premium status:", error));
}
 



document.addEventListener("DOMContentLoaded", () => {
  fetchExpenses();
  checkPremiumStatus();
});



