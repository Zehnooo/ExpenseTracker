// Create empty transaction array for storing
let transactions = [];
let deletedTransactions = [];
let currentEditId = null;
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
	}

    const deleted = localStorage.getItem("del-transactions");
    if (deleted) {
        deletedTransactions = JSON.parse(deleted);
    }
    transactionSorter();
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

    const formattedBalance = Math.abs(balance).toFixed(2);

    currentBalance.textContent = balance < 0 ? `-$${formattedBalance}` : `$${formattedBalance}`;
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
const editIncomeForm = document.getElementById("edit-income-form");
const editExpenseForm = document.getElementById("edit-expense-form")
const closeIncomeModalBtn = document.getElementById("close-income-modal");
const closeExpenseModalBtn = document.getElementById("close-expense-modal");
const deleteLog = document.getElementById("delete-log-container");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");

// hide deleted log if empty show if not
function hideEmpty(){
    if (deletedTransactions.length === 0){
        deleteLog.classList.add("hidden");
    } else {
        deleteLog.classList.remove("hidden");
    }
}


// sort transactions based on timestamp
function transactionSorter(){
transactions.sort((a, b) =>  new Date(b.timestamp) - new Date(a.timestamp));
  transactionList.innerHTML="";
  transactions.forEach(addTransactionToDOM);
}


// load all transactions on page load
loadTransactions();

// hide deleted log on page load if empty
hideEmpty();

// DOM Parsing function
function parseDisplayedAmount(element) {
	const rawText = element.textContent;
	const cleaned = rawText.replace(/[^0-9.-]+/g, "");
	const parsed = parseFloat(cleaned);
	return isNaN(parsed) ? 0 : parsed;
}
// push transaction to deleted transactions
function deleteTransaction(id){
    const deletedTx = transactions.find(tx => tx.id === id);
    if (!deletedTx) return;

    const li = document.querySelector(`#transaction-list li[data-id="${id}"]`);

    if (li) {
        li.classList.add('fade-out');
        setTimeout(() => {
            transactions = transactions.filter(tx => tx.id !== id);
            deletedTransactions.push(deletedTx);
            saveTransactions();
            addDeletedTransactions();
            transactionSorter();
            updateTotalsFromTransactions();
            updateBalanceClass();
            hideEmpty();
        }, 400);
    }
   
}
// rendering transactions 
function addTransactionToDOM(tx) {
    const li = document.createElement("li");
    li.classList.add(tx.type);
    li.dataset.id = tx.id;

    const content = document.createElement("span");
    content.classList.add("tx-content");

    const formattedAmount = `$${parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    
    if (tx.type === "income"){
        li.classList.add("income");
        content.innerHTML = `
        <div class="tx-row">📅 ${tx.date.toUpperCase()} 🕒 ${tx.time}</div>
        <div class="tx-row">📝 ${tx.description}</div>
        <div class="tx-row amount-line">💵 ${formattedAmount}</div>
    `;

    } else {
        li.classList.add("expense");
        content.innerHTML = `
        <div class="tx-row">📅 ${tx.date.toUpperCase()} 🕒 ${tx.time}</div>
        <div class="tx-row">🏢 ${tx.company} 📝 ${tx.description}</div>
        <div class="tx-row amount-line">💵 ${formattedAmount}</div>
    `;
    }

   

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => deleteTransaction(tx.id));

    const editBtn = document.createElement("button");
    editBtn.textContent="✏️";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => enterEditMode(tx.id)); 

    updateTotalsFromTransactions();
    hideEmpty();
    li.appendChild(content);
    li.appendChild(delBtn);
    li.appendChild(editBtn);
    transactionList.appendChild(li);

   
}
// undo deleted transaction
function undoTransactionDel(id){
    const tx = deletedTransactions.find(tx => tx.id === id);
    if (!tx) return;

    const li = document.querySelector(`#deleted-transactions li[data-id="${id}"]`);
    if (li){
        li.classList.add('fade-out');

        setTimeout(() => {

            deletedTransactions = deletedTransactions.filter(tx => tx.id !== id);
            transactions.push(tx);
            saveTransactions();
            transactionSorter();
            addDeletedTransactions();
            updateTotalsFromTransactions();
            updateBalanceClass();
            hideEmpty();

        }, 400);
      
    }
    
    
} 
// render deleted transactions
function addDeletedTransactions(){
    const deletedList = document.getElementById("deleted-transactions");
    deletedList.innerHTML = "";

    deletedTransactions.forEach(tx => {
        const li = document.createElement("li");
        li.classList.add("deleted", tx.type); // parent li gets layout class

        const content = document.createElement("span"); // add wrapper span
        content.classList.add("tx-content");

        const formattedAmount = `$${parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        content.innerHTML = `
        <div class="tx-row">📅 ${tx.date.toUpperCase()} 🕒 ${tx.time}</div>
        <div class="tx-row">📝 ${tx.description}</div>
        <div class="tx-row amount-line">💵 ${formattedAmount}</div>
    `;
        li.dataset.id = tx.id;

        const undoBtn = document.createElement("button");
        undoBtn.textContent = "↩️";
        undoBtn.classList.add("delete-btn"); // reuse styles
        undoBtn.addEventListener("click", () => undoTransactionDel(tx.id));

        const permDelete = document.createElement("button");
        permDelete.textContent = "✖️";
        permDelete.classList.add("edit-btn");

        permDelete.addEventListener("click", () => {
           if(confirm("Are you sure you want to permanetly delete this transaction?")) {

            li.classList.add('flash-delete');

                setTimeout(() => {
                    deletedTransactions = deletedTransactions.filter(dtx => dtx.id !== tx.id);
                    saveTransactions();
                    addDeletedTransactions();
                    hideEmpty();


                }, 400);
           }
        }) ;

       
      
        li.appendChild(content);
        li.appendChild(undoBtn);
        li.appendChild(permDelete);
        deletedList.prepend(li);
    });
    updateTotalsFromTransactions();
    updateBalanceClass();
}
// activate edit
function enterEditMode(id){
    const tx = transactions.find(tx => tx.id === id);
    if (!tx) return;

    if (tx.type === "income"){
        const expForm = document.getElementById("edit-expense-modal");
        const editForm = document.getElementById("edit-income-modal");
        expForm.classList.add("hidden");
        editForm.classList.remove("hidden");
        const editIncDesc = document.getElementById("edit-income-desc");
        const editIncAmou = document.getElementById("edit-income-amount");
     
        editIncDesc.value = tx.description;
        editIncAmou.value = tx.amount;

        currentEditId = id;

    } else if (tx.type === "expense"){
        const incForm = document.getElementById("edit-income-modal");
        const  editForm = document.getElementById("edit-expense-modal");
        incForm.classList.add("hidden");
        editForm.classList.remove("hidden");
        const editExpComp = document.getElementById("edit-expense-company");
        const editExpDesc = document.getElementById("edit-expense-desc");
        const editExpAmou = document.getElementById("edit-expense-amount");

        editExpComp.value = tx.company;
        editExpDesc.value = tx.description;
        editExpAmou.value = tx.amount;

        currentEditId = id;
    }
}

// edit income transactions
editIncomeForm.addEventListener("submit", function (event){
    event.preventDefault();
    const newIncDesc = document.getElementById("edit-income-desc");
    const newIncAmou = document.getElementById("edit-income-amount");

    const tx = transactions.find(tx => tx.id === currentEditId);
    if (!tx) return;

    

    tx.description = newIncDesc.value;
    tx.amount = newIncAmou.value;
    saveTransactions();
    transactionSorter();
    updateTotalsFromTransactions();
    updateBalanceClass();

    document.getElementById("edit-income-modal").classList.add("hidden");
 
    currentEditId = null;
});
// edit expense transactions

editExpenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newExpCompany = document.getElementById("edit-expense-company");
    const newExpDesc = document.getElementById("edit-expense-desc");
    const newExpAmou = document.getElementById("edit-expense-amount");

    const tx = transactions.find(tx => tx.id === currentEditId);
    if (!tx) return;

    tx.company = newExpCompany.value;
    tx.description = newExpDesc.value;
    tx.amount = newExpAmou.value;

    saveTransactions();
    transactionList.innerHTML="";
    transactions.forEach(addTransactionToDOM);
    updateTotalsFromTransactions();
    updateBalanceClass();

    document.getElementById("edit-expense-modal").classList.add("hidden");

    currentEditId = null;
});

// close modal button code

closeIncomeModalBtn.addEventListener("click", () => {
    document.getElementById("edit-income-modal").classList.add("hidden");
    currentEditId = null;
  });

  closeExpenseModalBtn.addEventListener("click", () => {
    document.getElementById("edit-expense-modal").classList.add("hidden");
    currentEditId = null;
  });


  // filter transactions
  function transactionFilter(type) {
    transactionList.innerHTML = "";

    let filtered = [];

    if (type === "all"){
        filtered = transactions;
    } else {
        filtered = transactions.filter(tx => tx.type === type);
    }
    filtered.forEach(addTransactionToDOM);
}

document.getElementById("filter-all").addEventListener("click", () => transactionFilter("all"));
document.getElementById("filter-income").addEventListener("click", () => transactionFilter("income"));
document.getElementById("filter-expense").addEventListener("click", () => transactionFilter("expense"));




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

    const timestamp = now.toISOString(); 
    const id =  crypto.randomUUID();

    const newTx = {
        id: id,
        type:"expense",
        company,
        description,
        amount,
        date: formattedDate,
        time: currentTime,
        timestamp: timestamp
    };

    addTransactionToDOM(newTx, true);
    transactions.push(newTx);
    saveTransactions();
    updateTotalsFromTransactions();
    updateBalanceClass();
    expenseForm.reset();
});

// submit income
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
    const timestamp = now.toISOString();
    const incomeBalance = incTotal + incAmou;
    const balance = parseFloat(currentBalance.textContent.replace(/[^0-9.-]+/g, ""));
    const updatedBalance = balance + incAmou;

    currentBalance.textContent = `$${updatedBalance.toFixed(2)}`;
    totalIncome.textContent = `$${incomeBalance.toFixed(2)}`;

    const id = crypto.randomUUID();
    
    const newTx = {
        id: id,
        type: "income",
        description: incDescrip,
        amount: incAmou,
        date: formattedDate,
        time: currentTime,
        timestamp: timestamp
    };

    addTransactionToDOM(newTx, true);
    transactions.push(newTx);
    saveTransactions();
    updateTotalsFromTransactions();
    updateBalanceClass();

    incomeForm.reset();
});

exportBtn.addEventListener("click", exportTransactions);
function exportTransactions(){
    let csvContent = "data:text/csv;charset=utf-8,"; // inform browser a csv file is being created

    //create headers
    csvContent += "Type,Company,Description,Amount,Date,Time,Timestamp\n";

    // run transaction data to rows
    transactions.forEach(tx => {
        const row = [
            tx.type,
            tx.company || "N/A",
            tx.description,
            tx.amount,
            tx.date.replace(/,/g, ""),
            tx.time,
            tx.timestamp
         ].join(",");

         csvContent += row + "\n";
    });

         const contentReady = encodeURI(csvContent);
         const link = document.createElement("a");
         link.setAttribute("href", contentReady);
         link.setAttribute("download","transactions.csv");
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
}

importBtn.addEventListener("click", () => {
    importFile.click();
});

importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function(e) {
      const fileContent = e.target.result;
      console.log(fileContent); // you now have the CSV text
    };
    reader.readAsText(file);
  });




updateBalanceClass();


