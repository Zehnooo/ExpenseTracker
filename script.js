// Create empty transaction array for storing
let transactions = [];
let deletedTransactions = [];

// Function to save transactions
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("del-transactions", JSON.stringify(deletedTransactions));
}
// Function to load transactions 
function loadTransactions() {
	const stored = localStorage.getItem("transactions");
	if (stored) {
		transactions = JSON.parse(stored);
		transactions.forEach(addTransactionToDOM);
	}

    const deleted = localStorage.getItem("del-transactions");
    if (deleted) {
        deletedTransactions = JSON.parse(deleted);
    }
    updateTotalsFromTransactions();
    addDeletedTransactions();
}
// function to  update totals on page load
function updateTotalsFromTransactions() {
    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach(tx => {

        if (tx.type === "income") {
            incomeTotal += Number(tx.amount);
        } else if (tx.type === "expense") {
            expenseTotal += Number(tx.amount);
        }
    });

    const balance = incomeTotal - expenseTotal;

    currentBalance.textContent = `$${balance.toFixed(2)}`;
    totalIncome.textContent = `$${incomeTotal.toFixed(2)}`;
    totalExpense.textContent = `$${expenseTotal.toFixed(2)}`;

}

function updateBalanceClass(){

    if (parseDisplayedAmount(currentBalance) > 0){
        currentBalance.classList.remove("negative");
        currentBalance.classList.add("positive");
    } else {
        currentBalance.classList.remove("positive");
        currentBalance.classList.add("negative");
    }
}

// Grab form and inputs
const expenseForm = document.getElementById("transaction-form");
const incomeForm = document.getElementById("income-form");
const compInput = document.getElementById("company");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const transactionList = document.getElementById("transaction-list");
const currentBalance = document.getElementById("current-balance");
const totalExpense = document.getElementById("day-expenses");
const incomeDescInp = document.getElementById("income-desc");
const incomeAmoInp = document.getElementById("income-amount");
const totalIncome = document.getElementById("day-income");

loadTransactions();


// DOM Parsing function
function parseDisplayedAmount(element) {
	const rawText = element.textContent;
	const cleaned = rawText.replace(/[^0-9.-]+/g, "");
	const parsed = parseFloat(cleaned);
	return isNaN(parsed) ? 0 : parsed;
}
function deleteTransaction(id){
    const deletedTx = transactions.find(tx => tx.id === id);
    if (deletedTx) {
        deletedTransactions.push(deletedTx);
    }

    transactions = transactions.filter(tx => tx.id !== id);
    addDeletedTransactions();
    saveTransactions();

    transactionList.innerHTML = "";
    transactions.forEach(addTransactionToDOM);
    updateTotalsFromTransactions();
}

function addTransactionToDOM(tx) {
    const li = document.createElement("li");
    li.classList.add(tx.type);

    const content = document.createElement("span");
    content.classList.add("tx-content");
    
    if (tx.type === "income"){
        li.classList.add("income");
        content.textContent = `📅 ${tx.date.toUpperCase()} 🕒 ${tx.time} 📝 ${tx.description} 💵 $${parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}`;
    } else {
        li.classList.add("expense");
        content.textContent = `📅 ${tx.date.toUpperCase()} 🕒 ${tx.time} 🏢 ${tx.company} 📝 ${tx.description} 💵 $${parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}`;
    }
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => deleteTransaction(tx.id));
    li.appendChild(content);
    li.appendChild(delBtn);
    transactionList.prepend(li);
}

function addDeletedTransactions(){
    const deletedList = document.getElementById("deleted-transactions");
    deletedList.innerHTML = "";

    deletedTransactions.forEach(tx => {
        const li = document.createElement("li");
        li.classList.add("deleted", tx.type); // parent li gets layout class

        const content = document.createElement("span"); // add wrapper span
        content.classList.add("tx-content");

        content.textContent = ` ${tx.date.toUpperCase()} ${tx.time} - ${tx.description} - $${parseFloat(tx.amount).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}  `;

        const undoBtn = document.createElement("button");
        undoBtn.textContent = "↩️";
        undoBtn.classList.add("delete-btn"); // reuse styles

        li.appendChild(content);
        li.appendChild(undoBtn);
        deletedList.prepend(li);
    });
}

/* function undoTransactionDel(tx.id){

} 
*/



// Add submit event listener
expenseForm.addEventListener("submit", function (event){
    event.preventDefault(); // stops page refresh on submit

    // get values
    const company = compInput.value;
    const description = descInput.value;
    const amount = Math.abs(parseFloat((amountInput.value)));
    const now = new Date();
    const expenseTotal = parseDisplayedAmount(totalExpense);

    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    const formattedDate = now.toLocaleDateString(undefined,options);
    const currentTime = now.toLocaleTimeString(undefined, {
        hour:'2-digit',
        minute: '2-digit'
    });

    const balance = parseDisplayedAmount(currentBalance);
    const updatedBalance = balance - amount;

    currentBalance.textContent = `$${updatedBalance.toFixed(2)}`;

    const updatedExpense = expenseTotal + amount;

    totalExpense.textContent = `$${updatedExpense.toFixed(2)}`;

    addTransactionToDOM({
        type:"expense",
        company,
        description,
        amount,
        date: formattedDate,
        time: currentTime
    });

    const id =  crypto.randomUUID();

    transactions.push({
        id: id,
        type:"expense",
        company,
        description,
        amount,
        date: formattedDate,
        time: currentTime
    });
    updateBalanceClass();
    saveTransactions();
    expenseForm.reset();
});

incomeForm.addEventListener("submit", function (event){
    event.preventDefault();

    const incDescrip = incomeDescInp.value;
    const incAmou = (parseFloat(incomeAmoInp.value));
    const incTotal = parseDisplayedAmount(totalIncome);

    const now = new Date();

    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    const formattedDate = now.toLocaleDateString(undefined,options);
    const currentTime = now.toLocaleTimeString(undefined, {
        hour:'2-digit',
        minute: '2-digit'
    });
    const incomeBalance = incTotal + incAmou;
    const balance = parseFloat(currentBalance.textContent.replace(/[^0-9.-]+/g, ""));
    const updatedBalance = balance + incAmou;

    currentBalance.textContent = `$${updatedBalance.toFixed(2)}`;
    totalIncome.textContent = `$${incomeBalance.toFixed(2)}`;

    
   addTransactionToDOM({
    type:"income",
    description: incDescrip,
    amount: incAmou,
    date: formattedDate,
    time: currentTime
   });
   const id = crypto.randomUUID();

    transactions.push({
        id: id,
        type:"income",
        description: incDescrip,
        amount: incAmou,
        date: formattedDate,
        time: currentTime
    });
    updateBalanceClass();
    saveTransactions();
    incomeForm.reset();
});
updateBalanceClass();


