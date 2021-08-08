const Modal = {
  modal: document.querySelector('.modal-overlay'),
  open() {
    document.querySelector('#message-error').classList.remove('active')
    this.modal.classList.add('active');
  },
  close() {
    document.querySelector('#message-error').classList.remove('active')
    this.modal.classList.remove('active');
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    this.all.push(transaction);
    App.reload();
  },

  remove(index) {
    this.all.splice(index, 1)
    App.reload();
  },

  incomes() {
    let income = 0;
    this.all.forEach(element => {
      if (element.amount > 0) {
        income += element.amount;
      }
    });
    return income;
  },

  expenses() {
    let expense = 0;
    this.all.forEach(element => {
      if (element.amount < 0) {
        expense += element.amount
      }
    })
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? 'income' : 'expense';

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${cssClass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
    </td>
    `
    return html;
  },
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
  },
  clearTransactions() {
    this.transactionContainer.innerHTML = "";
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';
    value = String(value).replace(/\D/g, '');
    value = Number(value) / 100;
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return signal + value
  },
  formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  }
}

const Form = {
  description: document.querySelector('input#description'),

  amount: document.querySelector('input#amount'),

  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value
    }
  },

  formatValues() {
    let { description, amount, date } = this.getValues();

    date = Utils.formatDate(date);
    amount = Utils.formatAmount(amount)

    return { description, amount, date };
  },

  validateFields() {
    const { description, amount, date } = this.getValues();
    if (description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos!");
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = "";
    Form.date.value = ";"
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction)
      Form.clearFields();
      Modal.close();
    } catch (error) {
      document.querySelector('#message-error').classList.add('active');
    }
  }

}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.updateBalance();
    Storage.set(Transaction.all);

  },
  reload() {
    DOM.clearTransactions()
    this.init()
  }
}

Storage.get();

App.init();












