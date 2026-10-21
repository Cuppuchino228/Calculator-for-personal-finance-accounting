let transactions = []
function init() {
    const saved = localStorage.getItem('myFinanceData')
    if (saved) {
        transactions = JSON.parse(saved)
    } else {
        transactions = []
    }
    renderTable()
    calculateStats()
    
    document.getElementById('date').valueAsDate = new Date()
}

init()

function addTransaction() {
    const amountInput = document.getElementById('amount')
    const type = document.getElementById('type').value
    const category = document.getElementById('category').value
    const date = document.getElementById('date').value
    const comment = document.getElementById('comment').value

    const amount = parseFloat(amountInput.value)
    if (isNaN(amount) || amount <= 0) {
        showMessage('Ошибка: введите корректную сумму больше нуля!', 'error')
        return
    }

    const newTrans = {
        id: Date.now(),
        amount: amount,
        type: type,
        category: category,
        date: date,
        comment: comment
    }

    transactions.push(newTrans)
    saveData()
    
    showMessage('Транзакция добавлена!', 'success')
    amountInput.value = ''
    renderTable()
    calculateStats()
}

function saveData() {
    localStorage.setItem('myFinanceData', JSON.stringify(transactions))
}

function renderTable(dataToShow = transactions) {
    const tbody = document.getElementById('transactionsList')
    tbody.innerHTML = ''

    const sorted = [...dataToShow].sort((a, b) => new Date(b.date) - new Date(a.date))

    sorted.forEach(t => {
        const row = `<tr>
            <td>${t.date}</td>
            <td style="color: ${t.type === 'income' ? 'green' : 'red'}">
                ${t.type === 'income' ? 'Доход' : 'Расход'}
            </td>
            <td>${t.category}</td>
            <td>${t.amount.toLocaleString()} ₽</td>
            <td>${t.comment || '-'}</td>
        </tr>`
        tbody.innerHTML += row
    })
}

function calculateStats() {
    let incomeSum = 0
    let expenseSum = 0

    transactions.forEach(t => {
        if (t.type === 'income') incomeSum += t.amount
        else expenseSum += t.amount
    })

    const balance = incomeSum - expenseSum

    document.getElementById('balance').innerText = balance.toLocaleString() + ' ₽'
    document.getElementById('incomeTotal').innerText = incomeSum.toLocaleString() + ' ₽'
    document.getElementById('expenseTotal').innerText = expenseSum.toLocaleString() + ' ₽'

    drawTextChart(expenseSum)
}

function drawTextChart(totalExpense) {
    const chartEl = document.getElementById('chart')
    chartEl.innerText = ''

    if (totalExpense === 0) {
        chartEl.innerText = 'Нет расходов для отображения'
        return
    }

    const categories = {}
    transactions.forEach(t => {
        if (t.type === 'expense') {
            if (!categories[t.category]) categories[t.category] = 0
            categories[t.category] += t.amount
        }
    })

    const maxSum = Math.max(...Object.values(categories))
    const maxBarLength = 40

    let chartText = ''
    
    for (const [cat, sum] of Object.entries(categories)) {
        const percent = (sum / totalExpense) * 100
        const barLen = Math.round((sum / maxSum) * maxBarLength)
        const bar = '#'.repeat(barLen)
        
        chartText += `${cat}: ${bar} (${sum.toLocaleString()} ₽, ${percent.toFixed(1)}%)\n`
    }

    chartEl.innerText = chartText
}

function applyFilters() {
    const filterType = document.getElementById('filterType').value
    const filterPeriod = document.getElementById('filterPeriod').value

    let filtered = transactions.filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false

        if (filterPeriod !== 'all') {
            const transDate = new Date(t.date)
            const now = new Date()
            let limitDate = new Date(now)

            if (filterPeriod === 'week') limitDate.setDate(now.getDate() - 7)
            if (filterPeriod === 'month') limitDate.setMonth(now.getMonth() - 1)

            if (transDate < limitDate) return false
        }
        return true
    })

    renderTable(filtered)
}

function resetFilters() {
    document.getElementById('filterType').value = 'all'
    document.getElementById('filterPeriod').value = 'all'
    renderTable()
}

function showMessage(text, type) {
    const msgBox = document.getElementById('message')
    msgBox.innerText = text
    msgBox.className = type
    
    setTimeout(() => {
        msgBox.className = ''
        msgBox.innerText = ''
    }, 3000)
}
