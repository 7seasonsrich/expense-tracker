document.addEventListener("DOMContentLoaded", function () {
    const expenseForm = document.getElementById("expense-form");
    const expenseTable = document.getElementById("expense-table");
    const savingsList = document.getElementById("savings-list");
    const expenseChartCanvas = document.getElementById("expense-chart");
    let expenseChart;

    // Fetch and display expenses from the backend
    function fetchExpenses() {
        fetch("/get_expenses")
            .then(response => response.json())
            .then(data => {
                expenseTable.innerHTML = "";
                let totalExpenses = 0;
                
                data.forEach(expense => {
                    let row = `<tr>
                                <td>${expense[1]}</td>
                                <td>${expense[2]}</td>
                                <td>$${expense[3].toFixed(2)}</td>
                               </tr>`;
                    expenseTable.innerHTML += row;
                    totalExpenses += expense[3];
                });
                
                calculateSavings(totalExpenses);
                updateChart(data);
            })
            .catch(error => console.error("Error fetching expenses:", error));
    }

    // Add a new expense to the backend and refresh the table
    expenseForm.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const date = document.getElementById("date").value;
        const category = document.getElementById("category").value;
        const amount = parseFloat(document.getElementById("amount").value);

        if (!date || !category || isNaN(amount) || amount <= 0) {
            alert("Please enter valid expense details.");
            return;
        }

        fetch("/add_expense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ date, category, amount })
        })
        .then(response => response.json())
        .then(() => {
            expenseForm.reset();
            fetchExpenses();
        })
        .catch(error => console.error("Error adding expense:", error));
    });

    // Calculate suggested savings based on expenses
    function calculateSavings(totalExpenses) {
        const monthlyIncome = 114400 / 12; // Monthly income of the truck driver
        const necessaryExpenses = totalExpenses * 0.8; // Assume 80% of expenses are necessary
        const suggestedSavings = monthlyIncome - necessaryExpenses;
        
        savingsList.innerHTML = `<li>Total Expenses: $${totalExpenses.toFixed(2)}</li>
                                 <li>Essential Spending: $${necessaryExpenses.toFixed(2)}</li>
                                 <li>Suggested Savings: $${suggestedSavings.toFixed(2)}</li>`;
    }

    // Update and display a pie chart for expense categories
    function updateChart(expenses) {
        const categories = {};
        expenses.forEach(expense => {
            categories[expense[2]] = (categories[expense[2]] || 0) + expense[3];
        });
        
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        if (expenseChart) {
            expenseChart.destroy();
        }
        
        expenseChart = new Chart(expenseChartCanvas, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF", "#FF9F40"]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Initial data load
    fetchExpenses();
});
