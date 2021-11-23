const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");
const { Console } = require("console");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Bem vindo ao nosso Banco. O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigada por utilizar nosso banco!"));
        process.exit();
      }
    })
    .catch((e) => console.log(e));
}

function errorHandler() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: ["Continuar", "Sair"],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Continuar") {
        operation();
      } else {
        console.log(chalk.bgBlue.black("Obrigada por utilizar nosso banco!"));
        process.exit();
      }
    })
    .catch((e) => console.log(e));
}

function createAccount() {
  console.log(chalk.bgGreen.black("Obrigada por escolher o nosso banco"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Defina um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`) || accountName === "") {
        console.log(chalk.bgRed.black("Nome de conta inválido"));
        errorHandler();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0 }',
        function (e) {
          console.log(e);
        }
      );

      console.log(chalk.green("Conta criada com sucesso"));
      operation();
    })
    .catch((e) => console.log(e));
}

function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da conta para depósito?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return errorHandler();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual o valor do depósito?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          addAmount(accountName, amount);
        })
        .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
}

function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return errorHandler();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$${accountData.balance}`
        )
      );
      operation();
    });
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return errorHandler();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual valor você deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          removeAmount(accountName, amount);
        })
        .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
}
function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black("Conta Inválida"));

    return false;
  }
  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  const isNumeric = isNaN(amount);

  if (!amount || amount <= 0 || isNumeric) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"));
    return errorHandler();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (e) {
      console.log(e);
    }
  );

  console.log(chalk.green(`Deposito de R$${amount} depositado com sucesso!`));
  operation();
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  const isNumeric = isNaN(amount);
  if (!amount || amount <= 0 || isNumeric) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"));
    return errorHandler();
  }

  if (amount > parseFloat(accountData.balance)) {
    console.log(chalk.bgRed.black("Saldo insuficiente para realizar o saque"));
    return errorHandler();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (e) {
      console.log(e);
    }
  );

  console.log(chalk.green(`Retirada de R$${amount} realizada  com sucesso!`));
  operation();
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
}
