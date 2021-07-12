const Modal = {
  open() {
    //Abrir modal

    document.querySelector('.modal-overlay').classList.add('active')
  },
  close() {
    //Fechar o modal e remover os erros
    document.querySelector('.modal-overlay').classList.remove('active')
    const verifyError = document.querySelectorAll('input')

    for (const element of verifyError) {
      element.classList.remove('error')
    }
  }
}

function changeColor() {
  let result = Transaction.total()

  if (result < 0) {
    Total.negative()
  } else {
    Total.positive()
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('pop.app:transactions')) || [] //
  },

  set(transactions) {
    localStorage.setItem('pop.app:transactions', JSON.stringify(transactions))
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
    for (var i = 0; i <= Transaction.all.length; i++) {
      Transaction.all.pop()
    }
    document.querySelector('.delete-all-overlay').classList.remove('show')
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

const Total = {
  negative() {
    document.querySelector('.total').classList.add('negative')
  },
  positive() {
    document.querySelector('.total').classList.remove('negative')
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
            
                <td class="description">${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td>
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                </td>
            
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

const ErrorModal = {
  openError() {
    document.querySelector('.modal-error').classList.add('show')
  },
  closeError() {
    document.querySelector('.modal-error').classList.remove('show')
  }
}

const DeleteAll = {
  openDeleteAll() {
    document.querySelector('.delete-all-overlay').classList.add('show')
  },
  closeDeleteAll() {
    document.querySelector('.delete-all-overlay').classList.remove('show')
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

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
  },

  validateField() {
    const { description, amount, date } = Form.getValues()

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error()
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction)
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateField()

      const transaction = Form.formatValues()

      Form.saveTransaction(transaction)

      Form.clearFields()

      Modal.close()
    } catch (error) {
      Form.formatError(), ErrorModal.openError()
    }
  }
}

/* Change mode ==================================*/

const html = document.querySelector('html')
const checkbox = document.querySelector('input[name=theme]')

const getStyle = (element, style) =>
  window.getComputedStyle(element).getPropertyValue(style)

const initialColors = {
  logo: getStyle(html, '--logo'),
  header: getStyle(html, '--header'),
  body: getStyle(html, '--body'),
  colorTable: getStyle(html, '--color-table'),
  fontFooter: getStyle(html, '--font-footer'),
  toggleBackground: getStyle(html, '--toggle-background'),
  togleLabel: getStyle(html, '--togle-label'),
  positive: getStyle(html, '--positive'),
  lightGreen: getStyle(html, '--light-green'),
  negative: getStyle(html, '--negative'),
  fontsCardTotal: getStyle(html, '--fonts-card-tota'),
  fonts: getStyle(html, '--fonts'),
  fontNewTransation: getStyle(html, '--font-new-transation'),
  fontsModal: getStyle(html, '--fonts-modal'),
  error: getStyle(html, '--error'),
  fontError: getStyle(html, '--font-error')
}

const darkMode = {
  // logo:
  header: '#162035',
  body: '#47597e',
  colorTable: '#dbe6fd',
  fontFooter: '#dbe6fd',
  toggleBackground: '#47597e',
  togleLabel: '#dbe6fd',
  positive: '#2a6b13',
  lightGreen: '#49aa26',
  negative: '#971515',
  // fontsCardTotal:
  // fonts:
  // fontNewTransation:
  fontsModal: '#dbe6fd'
  // error:
  // fontError:
}

const transformKey = key => '--' + key.replace(/([A-Z])/, '-$1').toLowerCase()

const changeColors = colors => {
  Object.keys(colors).map(key =>
    html.style.setProperty(transformKey(key), colors[key])
  )
}

checkbox.addEventListener('change', ({ target }) => {
  target.checked ? changeColors(darkMode) : changeColors(initialColors)
})

/* Fim do change mode ====================================*/

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reload() {
    changeColor()
    DOM.clearTransactions()

    App.init()
  }
}

App.init()
