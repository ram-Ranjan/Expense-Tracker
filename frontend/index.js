
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
        axios.post(`${base_url}/expense/addExpense`, expense , getAuthHeader())
            .then(response => {
                console.log('Server response:', response.data);
                // alert("Expense added successfully!");
                document.getElementById('expenseForm').reset();
                fetchExpenses();
                checkPremiumStatus();
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
                checkPremiumStatus();
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
                    // alert("Expense deleted successfully!");
                    fetchExpenses();
                    checkPremiumStatus();
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

    document.querySelector('.rzp-btn').addEventListener('click', async function(e) {
       
        e.preventDefault();
        const token= localStorage.getItem('token');
        try {
            const response = await axios.get(`${base_url}/purchase/premium`, getAuthHeader());
            console.log('Server response:', response.data);
    
            if (!response.data || !response.data.key_id || !response.data.order_id) {
                throw new Error('Invalid response from server');
            }

            const options = {
                "key":response.data.key_id,
                "order_id":response.data.order_id,
                //handler function will handle the successful payment
                "handler": async function(response){
                    await axios.post(`${base_url}/purchase/updateTransactionStatus`,{
                   order_id: options.order_id,
                   payment_id: response.razorpay_payment_id,
                },{headers :{"Authorization":`Bearer ${token}`}})   

                alert("You are a Premium User Now")
                checkPremiumStatus();
            },
            };

            const newRazorpayInstance = new Razorpay(options);
            newRazorpayInstance.open();
            
            newRazorpayInstance.on('payment.failed',function(response){
                console.log(response);
                alert('Something went wrong')
            });
    

        } catch (error) {
            console.error('Error initiating premium purchase:', error);
            alert('Failed to initiate premium purchase. Please try again.');
        }
    });

    function updateUIForPremiumUser() {
        // Hide the 'Become Premium' button
        document.querySelector('.rzp-btn').style.display = 'none';

        let leaderboardBtn =document.createElement('button');
        leaderboardBtn.className='leaderboardBtn';
        leaderboardBtn.textContent='Show Leaderboard';
        document.querySelector('table').appendChild(leaderboardBtn);
        let premiumFeatures = document.getElementById("premium");
        // premiumFeatures.style.display

        let reportBtn =document.createElement('button');
        reportBtn.className='reportBtn';
        reportBtn.textContent='View Report';
        document.querySelector('table').appendChild(reportBtn);
        
        
        // Add premium badge if it doesn't exist
        if (!document.querySelector('.premium-badge')) {
            const premiumBadge = document.createElement('span');
            premiumBadge.textContent = 'Premium User';
            premiumBadge.classList.add('premium-badge');
            document.querySelector('header').appendChild(premiumBadge);

        }

       leaderboardBtn.addEventListener('click',() => fetchLeaderboard())
       reportBtn.addEventListener('click',() => fetchReport())

    }


    function fetchLeaderboard() {

        let premiumFeatures = document.getElementById("premium");
        if(premiumFeatures.style.display=='none'){
            premiumFeatures.style.display='block'
            axios.get(`${base_url}/expense/premium/leaderboard`, getAuthHeader())
            .then(response => {
                let leaderboardData = response.data;
              
                premiumFeatures.innerHTML = `<h2>Expense Leaderboard</h2>`;
                const table = document.createElement('table');
                table.innerHTML = `
                <tr>
                    <th>Rank</th>
                    <th>Name</th> 
                    <th>Total Expense</th>
                </tr>`;
                leaderboardData.forEach((entry, index) => {
                    const row = table.insertRow();
                    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.username}</td>
                    <td>₹${entry.totalExpenses}</td>`; // Assuming totalExpense is a number
                    if (entry.isCurrentUser) {
                        row.classList.add('highlight');
                    }
                });
                premiumFeatures.appendChild(table);
               
            })
            .catch(err => {
                console.error('Error fetching leaderboard:', err);
                document.getElementById("premium").innerHTML = `<p>Failed to load leaderboard. Please try again later.</p>`;
            });
        }
        else{
            premiumFeatures.style.display='none'

        }
       
    }


    function fetchReport() {

        let report = document.getElementById("report");
        if(report.style.display=='none'){
            report.style.display='block'
            axios.get(`${base_url}/expense/premium/report`, getAuthHeader())
            .then(response => {
                let reportData = response.data.reverse();
              
                report.innerHTML = `<h2>Show History (last 10)</h2>`;
                const table = document.createElement('table');
                table.innerHTML = `
                <tr>
                    <th>Rank</th>
                    <th>Date</th> 
                    <th>Description</th> 
                    <th>Category</th>
                    <th>Income</th>
                    <th>Expense</th>
                </tr>`;
                reportData.forEach((entry, index) => {
                    const row = table.insertRow();
                    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.date}</td>
                    <td>${entry.description}</td>
                    <td>${entry.category}</td>
                    <td>${entry.income}</td>
                    <td>₹${entry.expense}</td>`; 
                    
                });
                report.appendChild(table);
               
            })
            .catch(err => {
                console.error('Error fetching report:', err);
                document.getElementById("report").innerHTML = `<p>Failed to load Report. Please try again later.</p>`;
            });
        }
        else{
            report.style.display='none'

        }
       
    }

    function checkPremiumStatus() {
        return axios.get(`${base_url}/user/premium/premiumStatus`, getAuthHeader())
            .then(response => {
                if (response.data.isPremium) {
                    updateUIForPremiumUser();
                } else {
                    // Ensure premium features are hidden for non-premium users
                    document.querySelector('.rzp-btn').style.display = 'block';
                    document.getElementById("premium").innerHTML = '';
                    const premiumBadge = document.querySelector('.premium-badge');
                    if (premiumBadge) premiumBadge.remove();
                }
            })
            .catch(error => {
                console.error('Error checking premium status:', error);
            });
    }


    document.addEventListener('DOMContentLoaded', function() {
        fetchExpenses();
        checkPremiumStatus();
    });





