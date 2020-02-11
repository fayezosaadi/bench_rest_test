const axios = require('axios');

const fetchTransactions = async (page = 1) => axios.get(`https://resttest.bench.co/transactions/${page}.json`);

const calculateDailyBalances = async (transactionsPerDay) => {
  const sortedDates = Object.keys(transactionsPerDay).sort();
  const [startingDate] = sortedDates;
  const dailyBalances = [ [startingDate, transactionsPerDay[startingDate]] ];

  for (let i = 1; i < sortedDates.length; i++) {
    const [, prevDayTotalBalance] = dailyBalances[i - 1];
    const currentDayTotalTransactions = transactionsPerDay[sortedDates[i]];
    const newBalance =  currentDayTotalTransactions +  prevDayTotalBalance;

    dailyBalances.push([ sortedDates[i], Math.round(newBalance * 100) / 100 ])
  }

  return dailyBalances
};

const getTransactionsByDay = async (transactionsList, transactions = {}) => {
  for (const { Date: date, Amount: amount } of transactionsList) {

      transactions = {
        ...transactions,
        [date]: transactions[date] ? Number(transactions[date]) + Number(amount) : Number(amount)
      }

    }

    return transactions
};

const main = async () => {
  const { data } = await fetchTransactions();
  let transactionsByDay = await getTransactionsByDay(data.transactions);
  let numberOfTransactionsFetched = data.transactions.length;
  let page = 1;

  while ( numberOfTransactionsFetched < data.totalCount) {
    page += 1;
    const { data: { transactions } } = await fetchTransactions(page);
    transactionsByDay = await getTransactionsByDay(transactions, transactionsByDay);
    numberOfTransactionsFetched += transactions.length;
  }

  return calculateDailyBalances(transactionsByDay);
};

const start = async () => {
  const runningDailyBalances = await main();

  for (const [date, balance] of runningDailyBalances) { console.log(date, balance); }
};

module.exports = {
  start: async () => start(),
  main,
  getTransactionsByDay,
  calculateDailyBalances
};
