const base_url = "http://localhost:3000/api";

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
}


document.getElementById('expenseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value.trim();

    const expense = { category, amount: parseFloat(amount), description };
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
        axios.post(`${base_url}/expense`, expense , getAuthHeader())
            .then(response => {
                console.log('Server response:', response.data);
                alert("Expense added successfully!");
                document.getElementById('expenseForm').reset();
                fetchExpenses();
            })
            .catch(err => {
                console.error('Error details:', err.response?.data || err.message);
                alert("Failed to add expense: " + (err.response?.data?.error || err.message));
            });
    }
    
    function updateExpense(expenseId, expense) {
        axios.put(`${base_url}/expense/${expenseId}`, expense, getAuthHeader())
            .then(response => {
                console.log('Server response:', response.data);
                alert("Expense updated successfully!");
                document.getElementById('expenseForm').reset();
                document.getElementById('expenseForm').dataset.editId = '';
                document.querySelector('button[type="submit"]').textContent = 'Add Expense';
                fetchExpenses();
            })
            .catch(err => {
                console.error('Error details:', err.response?.data || err.message);
                alert("Failed to update expense: " + (err.response?.data?.error || err.message));
            });
    }
    
    function deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            axios.delete(`${base_url}/expense/${expenseId}`,getAuthHeader())
                .then(response => {
                    console.log('Server response:', response.data);
                    alert("Expense deleted successfully!");
                    fetchExpenses();
                })
                .catch(err => {
                    console.error('Error details:', err.response?.data || err.message);
                    alert("Failed to delete expense: " + (err.response?.data?.error || err.message));
                });
        }
    }
    
    function fetchExpenses() {
        axios.get(`${base_url}/expense`, getAuthHeader())
            .then(response => {

                const expenses = response.data;
                const expenseList = document.getElementById('expenseList');
                expenseList.innerHTML = ''; // Clear existing list
                
                expenses.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.category}</td>
                        <td>&#8377;${expense.amount}</td>
                        <td>${expense.description}</td>
                        <td>
                            <button class="edit-btn" data-id="${expense.expenseId}">Edit</button>
                            <button class="delete-btn" data-id="${expense.expenseId}">Delete</button>
                        </td>
                    `;
                    expenseList.appendChild(row);
                });
                
                // Add event listeners for edit and delete buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', handleEdit);
                });
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', handleDelete);
                });
            })
            .catch(err => {
                document.querySelector('main').innerHTML=`
                <h1>404 NOT FOUND</h1><BR><BR>
                <h2>Page Not Found</h2>
                `;

                console.error("Failed to fetch expenses:", err);
            });
    }
    
    function handleEdit(event) {
        const expenseId = event.target.dataset.id;
        axios.get(`${base_url}/expense/${expenseId}`,getAuthHeader())
            .then(response => {
                const expense = response.data;
                document.getElementById('category').value = expense.category;
                document.getElementById('amount').value = expense.amount;
                document.getElementById('description').value = expense.description;
                document.getElementById('expenseForm').dataset.editId = expenseId;
                document.querySelector('button[type="submit"]').textContent = 'Update Expense';
            })
            .catch(err => {
                console.error('Error fetching expense details:', err);
                alert("Failed to fetch expense details");
            });
    }
    
    function handleDelete(event) {
        const expenseId = event.target.dataset.id;
        deleteExpense(expenseId);
    }

    document.querySelector('.logout').addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }); 

    document.addEventListener('DOMContentLoaded', fetchExpenses);

