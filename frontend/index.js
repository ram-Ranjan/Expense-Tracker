const base_url = "http://localhost:3000/api";

document.getElementById('expenseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value.trim();

    const expense = { category, amount: parseFloat(amount), description };
    
    axios.post(`${base_url}/expense`, expense)
        .then(response => {
            console.log('Server response:', response.data);
            alert("Expense added successfully!");
            console.log('Expense added:', response.data);
            document.getElementById('expenseForm').reset();
            fetchExpenses();
        })
        .catch(err => {
            console.error('Error details:', err.response?.data || err.message);
            alert("Failed to add expense: " + (err.response?.data?.error || err.message));
        });
});

function fetchExpenses() {
    axios.get(`${base_url}/expense`)
        .then(response => {
            const expenses = response.data;
            const expenseList = document.getElementById('expenseList');
            expenseList.innerHTML = ''; // Clear existing list

            expenses.forEach(expense => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${expense.category}</td>
                    <td>$${expense.amount}</td>
                    <td>${expense.description}</td>
                `;
                expenseList.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Failed to fetch expenses:", err);
        });
}

document.addEventListener('DOMContentLoaded', fetchExpenses);