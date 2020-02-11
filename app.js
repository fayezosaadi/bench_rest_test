const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 });

const fetchTransactions = async (page = 1) => {
  try {
    return axios.get(`https://resttest.bench.co/transactions/${page}.json`);
  } catch (e) {
    throw new Error(e)
  }
};

/**
 *
 * @param transactionsByDate {{}}
 * @returns {Promise<[[string, number]]>}
 *
 * calculateDailyBalances sort dates from transactionsByDate and calculates daily balances for each day
 *
 */
const calculateDailyBalances = async (transactionsByDate) => {
  const sortedDates = Object.keys(transactionsByDate).sort();
  const [startingDate] = sortedDates;
  const dailyBalances = [ [startingDate, transactionsByDate[startingDate]] ];

  for (let i = 1; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const [, prevDateTotalBalance] = dailyBalances[i - 1];
    const currentDateTotalTransactions = transactionsByDate[sortedDates[i]];
    const newBalance =  currentDateTotalTransactions +  prevDateTotalBalance;

    dailyBalances.push([ date, Math.round(newBalance * 100) / 100 ])
  }

  return dailyBalances
};

/**
 *
 * @param transactionsList {[]}
 * @param transactions {{}}
 * @returns {Promise<{}>}
 *
 * groupTransactionsByDate returns a new object with date key
 * and value equals the sum of amounts for this date
 *
 */
const groupTransactionsByDate = async (transactionsList, transactions = {}) => {
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
    let transactionsByDate = await groupTransactionsByDate(data.transactions);
    let numberOfTransactionsFetched = data.transactions.length;
    let page = 1;

    while ( numberOfTransactionsFetched < data.totalCount) {
      page += 1;
      const { data: { transactions } } = await fetchTransactions(page);
      transactionsByDate = await groupTransactionsByDate(transactions, transactionsByDate);
      numberOfTransactionsFetched += transactions.length;
    }

    return calculateDailyBalances(transactionsByDate);
};

const start = async () => {
  try {
    const runningDailyBalances = await main();
    for (const [date, balance] of runningDailyBalances) { console.log(date, balance); }
  } catch (e) {
    console.error(e.message);
  }
};

module.exports = {
  start: async () => start(),
  main,
  groupTransactionsByDate,
  calculateDailyBalances
};
