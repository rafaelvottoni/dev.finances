const Modals = {
  modalForm() {
    document.querySelector('.modal-form-overlay').classList.toggle('show')
  },

  modalErrorOpen() {
    document.querySelector('.modal-error-overlay').classList.add('show')
  },

  modalErrorClose() {
    document.querySelector('.modal-error-overlay').classList.remove('show')
  },

  modalDeleteAll() {
    document.querySelector('.modal-delete-overlay').classList.toggle('show')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('poup.app:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem('poup.app:transactions', JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  removeAll() {
    Transaction.all = []

    document.querySelector('.modal-delete-overlay').classList.remove('show')
    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })
    return expense
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="${CSSclass}">${amount}</td>
      <td class="description">${transaction.description}</td>
      <td class="category"> <i class="icon-${transaction.category}"></i></td>
      <td class="date">${transaction.date}</td>
      <td> <i class ="icon-minus-circle" onclick="Transaction.remove(${index})"></i></td> 
      `

    return html
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    )
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    )
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    )
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatAmount(value) {
    value = value * 100
    return Math.round(value)
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  typeOfTransaction() {
    let typeOfTransaction = document.getElementsByName('type-transaction')

    for (let i = 0; i < typeOfTransaction.length; i++) {
      if (typeOfTransaction[i].checked) {
        return typeOfTransaction[i].value
      }
    }
    return null
  },

  categoryOfTransaction() {
    let getCategory = document.getElementById('tag')
    let category = getCategory.options[getCategory.selectedIndex].value
    return category
  },

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === '' ||
      Form.typeOfTransaction() === null
    ) {
      throw new Error()
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    if (Form.typeOfTransaction() == 'expense') {
      amount = -amount
    }

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    category = Form.categoryOfTransaction()

    return {
      description: description,
      amount: amount,
      date: date,
      category: category
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  clearTypeOfTransaction() {
    let TypeOfTransaction = document.getElementsByName('type-transaction')
    for (let i = 0; i < TypeOfTransaction.length; i++)
      TypeOfTransaction[i].checked = false
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)

      Form.clearFields()
      Form.clearTypeOfTransaction()
      ErrorForm.removeError()
      Modals.modalForm()
    } catch (error) {
      Modals.modalErrorOpen()
      ErrorForm.formatError()
    }
  }
}

const FormatOptionOfSelection = {
  modifyOptions: `
  <option value="others" selected>Outros</option>
  <option value="food">Alimentação</option>
  <option value="house">Casa</option>
  <option value="leisure">Lazer</option>
  <option value="health">Saúde</option>
  <option value="transport">Transporte</option>
  <option value="clothing">Vestuário</option>
  `,

  selectHTML: document.querySelector('#tag'),

  ifExpense() {
    this.selectHTML.innerHTML = ''
    this.selectHTML.innerHTML = this.modifyOptions
  },

  ifIncome() {
    this.selectHTML.innerHTML = ''
    this.selectHTML.innerHTML = `<option value="income" selected>Entrada</option>`
  }
}

const ErrorForm = {
  formatError() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === '') {
      document.querySelector('.input-group #description').classList.add('error')
    } else {
      document
        .querySelector('.input-group #description')
        .classList.remove('error')
    }
    if (amount.trim() === '') {
      document.querySelector('.input-group #amount').classList.add('error')
    } else {
      document.querySelector('.input-group #amount').classList.remove('error')
    }
    if (date.trim() === '') {
      document.querySelector('.input-group #date').classList.add('error')
    } else {
      document.querySelector('.input-group #date').classList.remove('error')
    }
    if (Form.typeOfTransaction() == null) {
      document.querySelector('.type-transaction').classList.add('error')
    } else {
      document.querySelector('.type-transaction').classList.remove('error')
    }
  },

  removeError() {
    document
      .querySelector('.input-group #description')
      .classList.remove('error')
    document.querySelector('.input-group #amount').classList.remove('error')
    document.querySelector('.input-group #date').classList.remove('error')
    document.querySelector('.type-transaction').classList.remove('error')
  }
}

const DarkMode = {
  HTML: document.querySelector('html'),

  changeMode() {
    this.HTML.classList.toggle('dark-mode')
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()
    DataGraph.saveDataGraph()
    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

const DataGraph = {
  saveDataGraph() {
    localStorage.removeItem('others')
    localStorage.removeItem('food')
    localStorage.removeItem('house')
    localStorage.removeItem('leisure')
    localStorage.removeItem('health')
    localStorage.removeItem('transport')
    localStorage.removeItem('clothing')

    Transaction.all.forEach((category, index) => {
      category = Transaction.all[index].category

      switch (category) {
        case 'others':
          let others = localStorage.getItem('others')

          if (others == null) {
            others = 0
          }
          others =
            parseFloat(others) +
            parseFloat(-Transaction.all[index].amount / 100)
          localStorage.setItem('others', others)
          break
        case 'food':
          let food = localStorage.getItem('food')

          if (food == null) {
            food = 0
          }

          food =
            parseFloat(food) + parseFloat(-Transaction.all[index].amount / 100)

          localStorage.setItem('food', food)
          break
        case 'house':
          let house = localStorage.getItem('house')
          if (house == null) {
            house = 0
          }

          house =
            parseFloat(house) + parseFloat(-Transaction.all[index].amount / 100)
          localStorage.setItem('house', house)
          break
        case 'leisure':
          let leisure = localStorage.getItem('leisure')
          if (leisure == null) {
            leisure = 0
          }

          leisure =
            parseFloat(leisure) +
            parseFloat(-Transaction.all[index].amount / 100)
          localStorage.setItem('leisure', leisure)
          break
        case 'health':
          let health = localStorage.getItem('health')
          if (health == null) {
            health = 0
          }

          health =
            parseFloat(health) +
            parseFloat(-Transaction.all[index].amount / 100)
          localStorage.setItem('health', health)
          break
        case 'transport':
          let transport = localStorage.getItem('transport')
          if (transport == null) {
            transport = 0
          }

          transport =
            parseFloat(transport) +
            parseFloat(-Transaction.all[index].amount / 100)
          localStorage.setItem('transport', transport)
          break
        case 'clothing':
          let clothing = localStorage.getItem('clothing')

          if (clothing == null) {
            clothing = 0
          }

          clothing =
            parseFloat(clothing) +
            parseFloat(-Transaction.all[index].amount / 100)
          localStorage.setItem('clothing', clothing)
          break
      }
    })
  }
}

// Graphic

const Graph = {
  others: parseFloat(localStorage.getItem('others')),
  food: parseFloat(localStorage.getItem('food')),
  house: parseFloat(localStorage.getItem('house')),
  leisure: parseFloat(localStorage.getItem('leisure')),
  health: parseFloat(localStorage.getItem('health')),
  transport: parseFloat(localStorage.getItem('transport')),
  clothing: parseFloat(localStorage.getItem('clothing'))
}

let ctx = document.querySelector('.chart')

let chart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: [
      'Outros',
      'Alimentação',
      'Casa',
      'Lazer',
      'Saúde',
      'Transporte',
      'Vestuário'
    ],
    datasets: [
      {
        data: [
          Graph.others,
          Graph.food,
          Graph.house,
          Graph.leisure,
          Graph.health,
          Graph.transport,
          Graph.clothing
        ],
        backgroundColor: [
          '#FF9899',
          '#FFC198',
          '#FFE590',
          '#B8FFA3',
          '#A6F9FF',
          '#9CB7FE',
          '#BE9EFF'
        ],
        hoverOffset: 4,
        borderWidth: 1,
        position: 'left'
      }
    ]
  },
  options: {
    aspectRatio: 2.2,
    layout: {
      padding: 0
    },
    plugins: {
      legend: {
        align: 'center',
        position: 'right',
        labels: {
          textAlign: 'left',
          boxWidth: 15,
          color: '#AEAEB6',
          borderColor: 'white',
          padding: 3,
          font: {
            family: "'Poppins', 'sans-serif'"
          }
        }
      }
    }
  }
})

App.init()
