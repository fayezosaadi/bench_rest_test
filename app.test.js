const axios = require('axios');

const { getTransactionsByDay, calculateDailyBalances, main } = require("./app");

const transactionsMock = [
  {
    Date: "2013-12-13",
    Ledger: "Business Meals & Entertainment Expense",
    Amount: "-10.5",
    Company: "MCDONALDS RESTAURANT"
  },
  {
    Date: "2013-12-12",
    Ledger: "Insurance Expense",
    Amount: "-20",
    Company: "AA OFFICE SUPPLIES"
  },
  {
    Date: "2013-12-12",
    Ledger: "Insurance Expense",
    Amount: "-10",
    Company: "AA OFFICE SUPPLIES"
  },
];
const transactionsAPIMock1 = {
  "totalCount": 5,
  "page": 1,
  "transactions": [
    {
      "Date": "2013-12-19",
      "Ledger": "Travel Expense, Nonlocal",
      "Amount": "-200",
      "Company": "YELLOW CAB COMPANY LTD VANCOUVER"
    },
    {
      "Date": "2013-12-18",
      "Ledger": "Business Meals & Entertainment Expense",
      "Amount": "-8.94",
      "Company": "NESTERS MARKET #x0064 VANCOUVER BC"
    },
  ]
};
const transactionsAPIMock2 = {
  "totalCount": 5,
  "page": 2,
  "transactions": [
    {
      "Date": "2013-12-19",
      "Ledger": "Travel Expense, Nonlocal",
      "Amount": "-200",
      "Company": "YELLOW CAB COMPANY LTD VANCOUVER"
    },
    {
      "Date": "2013-12-18",
      "Ledger": "Business Meals & Entertainment Expense",
      "Amount": "-10.94",
      "Company": "NESTERS MARKET #x0064 VANCOUVER BC"
    },
  ]
};
const transactionsAPIMock3 = {
  "totalCount": 5,
  "page": 3,
  "transactions": [
    {
      "Date": "2013-12-19",
      "Ledger": "Travel Expense, Nonlocal",
      "Amount": "-200",
      "Company": "YELLOW CAB COMPANY LTD VANCOUVER"
    },
  ]
};

let transactionsByDay;

jest.mock('axios');

describe("App tests", () => {

  test('returns sum of transactions per day', async () => {
    transactionsByDay = await getTransactionsByDay(transactionsMock);
    expect(Object.keys(transactionsByDay).length).toBe(2);
    expect(transactionsByDay["2013-12-13"]).toBe(-10.5);
    expect(transactionsByDay["2013-12-12"]).toBe(-30);
  });

  test('returns running daily balances', async () => {
    const dailyBalances = await calculateDailyBalances(transactionsByDay);
    const [firstDay, secondDay] = dailyBalances;

    expect(dailyBalances.length).toBe(Object.keys(transactionsByDay).length);
    expect(firstDay[1]).toBe(-30);
    expect(secondDay[1]).toBe(-40.5);
  });

  test('fetches data from transactions API and returns running daily balances', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: transactionsAPIMock1 }));
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: transactionsAPIMock2 }));
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: transactionsAPIMock3 }));
    const [[firstDate, balance1], [secondDate, balance2]] = await main();
    expect(firstDate).toBe('2013-12-18');
    expect(secondDate).toBe('2013-12-19');
    expect(balance1).toBe(-19.88);
    expect(balance2).toBe(-619.88);
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenCalledWith(`https://resttest.bench.co/transactions/1.json`);
    expect(axios.get).toHaveBeenCalledWith(`https://resttest.bench.co/transactions/2.json`);
    expect(axios.get).toHaveBeenCalledWith(`https://resttest.bench.co/transactions/3.json`);
  });

});
