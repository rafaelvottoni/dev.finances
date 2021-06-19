//uso o const porque sei que no decorrer do programa não vou criar nada que o modifique
const Modal = {
    open() {
        //Abrir modal
        //Adicionar a class active ao modal
        //ele prucara o modal overlay e adiciona a clase active:
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        //Fechar o modal
        //Remover a class active do modal
        //ele prucara o modal overlay e remove a clase active:
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] // o nome que que eu escolhi. se não existir esse nome, entregar um array vazio
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //o primeiro argumento eu escolhi o nome
    },
}

// Eu preciso somar as entradas, depois preciso somar as saidas e fazer a subtração entre as duas. assim eu terei o total
const Transaction = {
    //pegar todas as transações, verificar se é maior que 0, se for maior que 0 somar a uma variavel e retornar a variavel. o mesmo para se for menor que 0
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        //somar as entradas
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        //somar as saídas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        //entradas - saídas

        return Transaction.incomes() + Transaction.expenses() //sinal de + porque os expenses ja vem com os sinais de negativo
    }
}

//Eu preciso pegar as minhas transações do meu objeto aqui no javascript e colocar la no HTML
//Substituir os dados do HTML com os dados do JS

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

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
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }


}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")  // \D procura tudo o que não é numero, se eu colocar sem o g, ele troca apenas o primeiro que encontrar. ao colocar o g ele pega todos que encontrar

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", { //algo nativo do javascript para formatar moedas
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {

    //verificar se todas as informações foram preenchidas
    //formatar os dados para salvar
    //salvar
    //apagar os dados do formulario
    //fechar modal
    //atualizar a aplicação

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateField() {
        const { description, amount, date } = Form.getValues()


        //     a forma que foi feita é uma forma resumida disso aqui:  
        //     const description = Form.getValues().description
        //     const amount = Form.getValues().amount
        //     const date = Form.getValues().date

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            //description: description, //quando o nome da chave é o mesmo da variável, eu não preciso colocar os dois pontos. posso digitar apenas o nome
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)

    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault() //para interromper o evento padrão do submit

        try {
            Form.validateField() // verificar se todas as informações foram preenchidas

            const transaction = Form.formatValues() //formatar os dados

            Form.saveTransaction(transaction) //salvar //no add já há um app.reload então nem preciso colocar app.reload novamente

            Form.clearFields() //apagar os dados do formulário

            Modal.close() //fechar modal. 

        } catch (error) {
            alert(error.message) //aqui eu coloco o que vai acontecer se der erro
        }



    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => { //é a me coisa de: Transaction.all.forEach(function(transaction,index){...})

            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()
        
        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions() //sem essa função, ele imprimiria tudo de novo, pois passaria pelo init de novo e adicionando a nova entrada. com a função ele limpa tudo antes de executar o init de novo, então vai aparecer tudo com a adição, mas não vai repetir.
        App.init()
    },
}

App.init()


