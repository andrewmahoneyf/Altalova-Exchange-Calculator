document.getElementById("amount").addEventListener("keyup", outputScript);
document.getElementById("swap").addEventListener("click", flip);
document.getElementById("transaction").addEventListener("change", updateCurrency);
document.getElementById("origin").addEventListener("change", updateCurrency);
document.getElementById("recipient").addEventListener("change", updateCurrency);


// fetch ptax buy and sell BR$
const url = 'https://api.vitortec.com/currency/quotation/v1.2/';
fetch(url)
    .then((resp) => resp.json())
    .then(function (data) {
        let countries = data.data.currency;
        return countries.map(function (country) {
            let span = document.createElement('span');
            bid = country.buying;
            bid = bid.substring(0, bid.length - 4);
            ask = country.selling;
            ask = ask.substring(0, ask.length - 4);
            if (country.code == "USD") {
                span.innerHTML = `${"BID: " + bid} ${"ASK: " + ask}`;
                document.getElementById('buy').innerHTML = bid;
                document.getElementById('sell').innerHTML = ask;
                document.getElementById('td').innerHTML = span.innerHTML;
            }
        })
    })
    .catch(function (error) {
        console.log(JSON.stringify(error));
    });

// main function to output the table and script on compare submit
function outputScript() {
    var output = document.getElementById("root");
    var origin = document.getElementById("origin").value;
    origin = origin.substring(0, origin.length - 6);
    var recipient = document.getElementById("recipient").value;
    recipient = recipient.substring(0, recipient.length - 6);
    var transaction = document.getElementById("transaction").value;
    var amount = document.getElementById("amount").value;
    var currency = document.getElementById("currency").innerHTML;
    var fraction = document.getElementById("fraction").innerHTML;
    if (transaction == "send") {
        var phrase = "Cost to send " + amount + fraction + " " + currency + " from " + origin + " to " + recipient + ":";
    } else {
        var phrase = "Cost to recieve " + amount + fraction + " " + currency + " from " + origin + " in " + recipient + ":";
    }

    document.getElementById("tbody").classList.add("invisible");
    document.getElementById("thead").classList.add("invisible");
    document.getElementById("difference").classList.add("invisible");
    if (!amount) {
        output.innerHTML = "Please input an amount!";
    } else if (amount < 1) {
        output.innerHTML = "Please input an amount above 1 dollar.";
    } else if (amount >= 5000 && currency == "USD") {
        output.innerHTML = "Please input an amount lower than $5,000";
    } else if (amount >= 20000 && currency == "BRL") {
        output.innerHTML = "Please input an amount lower than R$20.000";
    } else {
        output.innerHTML = phrase;
        var ptax = getNum(recipient);
        document.getElementById('td').innerHTML = ptax;
        tableBody(ptax, recipient, transaction);
        getDifference(recipient);
    }
}

// helper funtion to get correct ptax 
function getNum(recipient) {
    var num = 0.0;
    if (recipient == "USA") {
        num = parseFloat(document.getElementById('buy').innerHTML);
        num = num / 10;
    } else {
        num = parseFloat(document.getElementById('sell').innerHTML);
    }
    return num;
}

// function takes in the correct information and outputs the table with the data recieved
function tableBody(ptax, recipient, transaction) {
    var amount = document.getElementById("amount").value;
    amount = parseFloat(amount);
    var iof = .0038; 
    var onlineRate = fiveDecimal(ptax * (1 + .0219 + iof));
    if (ptax > 1) { // sending from US
        var mgFee = usFee(amount);
        var mgRate = fiveDecimal(ptax - .1742);
        //var onlineTotal = twoDecimal(amount + 20);
        var bankFee = 45; // figure out
        var bankRate = 2.99;
    } else { // sending from Brazil
        var mgFee = brFee(amount, ptax);
        var mgRate = fiveDecimal(ptax + .01742 * (1 + iof));
        var bankFee = amount * .0166;
        if (bankFee < 36) {
            bankFee = 36;
        } else if (bankFee > 166) {
            bankFee = 166;
        }
        bankFee = (bankFee/ptax);
        var bankRate = fiveDecimal(.3310 * (1 + iof));
    }
    var mgTotal = twoDecimal(amount + mgFee);
    var onlineTotal = twoDecimal(amount + 62.10);
    var bankTotal = twoDecimal(amount + bankFee);
    var altalovaTotal = twoDecimal(amount + (amount * .03));
    ptax = fiveDecimal(ptax);

    if (recipient == "Brazil" && transaction == "send") {
        var bank = "Total Cost= $" + bankTotal + "<br> Recieved= R$" + twoDecimal(amount * bankRate) + "<br><i>*Exchange rate offered: " + bankRate + "</i>";
        var mg = "Total Cost= $" + mgTotal + "<br> Recieved= R$" + twoDecimal(amount * mgRate) + "<br> <i>*Exchange rate offered: " + mgRate + "</i>";
        //var online = "Total Cost= $" + onlineTotal + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var online = "Service not offered";
        var altalova = "Total Cost= $" + altalovaTotal + "<br> Recieved= R$" + twoDecimal(amount * ptax) + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    } else if (recipient == "USA" && transaction == "send") {
        var bank = "Total Cost= R$" + bankTotal + "<br> Recieved= $" + twoDecimal(amount/ (bankRate * 10)) + "<br> <i>*Exchange rate offered: " + bankRate + "</i>";
        var mg = "Total Cost= R$" + mgTotal + "<br> Recieved= $" + twoDecimal(amount/ (mgRate * 10)) + "<br> <i>*Exchange rate offered: " + mgRate + "</i>";
        var online = "Total Cost= R$" + onlineTotal + "<br> Recieved= $" + twoDecimal(amount/ (onlineRate * 10)) + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var altalova = "Total Cost= R$" + altalovaTotal + "<br> Recieved= $" + twoDecimal(amount/ (ptax * 10)) + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    } else if (recipient == "Brazil" && transaction == "recieve") {
        var bank = "Total Cost= $" + twoDecimal((amount/ bankRate)) + "<br> <i>*Exchange rate offered: " + bankRate + "</i>";
        var mg = "Total Cost= $" + twoDecimal((amount/ mgRate) + mgFee) + "<br> <i>*Exchange rate offered: " + mgRate + "</i>";
        //var online = "Total Cost= $" + twoDecimal((amount/onlineRate + 20)) + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var online = "Service not offered";
        var altalova = "Total Cost= $" + twoDecimal((amount/ ptax) * 1.03) + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    } else {
        var bank = "Total Cost= R$" + twoDecimal((amount/ bankRate) + iof) + "<br> <i>*Exchange rate offered: " + bankRate + "</i>";
        var mg = "Total Cost= R$" + twoDecimal((amount/ mgRate) + iof + mgFee) + "<br> <i>*Exchange rate offered: " + mgRate + "</i>";
        var online = "Total Cost= R$" + twoDecimal(((amount * (onlineRate * 10)) + iof + 62.10)) + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var altalova = "Total Cost= R$" + twoDecimal((amount/ ptax + (amount * .03))) + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    }

    document.getElementById("tbody").classList.remove("invisible");
    document.getElementById("banks").innerHTML = bank;
    document.getElementById("mg").innerHTML = mg;
    document.getElementById("online").innerHTML = online;
    document.getElementById("altalova").innerHTML = altalova;
}

// funtion calculates the amount saved by using altalova
function getDifference(recipient) {
    document.getElementById("difference").classList.add("difference");
    var low = document.getElementById("altalova").innerHTML;
    low = low.substring(low.indexOf("$") + 1, low.indexOf("*") - 8);
    low = parseFloat(low);
    var high = document.getElementById("mg").innerHTML;
    high = high.substring(high.indexOf("$") + 1, high.indexOf("*") - 8);
    high = parseFloat(high);
    var bank = document.getElementById("banks").innerHTML;
    bank = bank.substring(bank.indexOf("$") + 1, bank.indexOf("*") - 8);
    bank = parseFloat(bank);
    if (bank > high) {
        high = bank;
    }
    if (recipient == "USA") {
        var temp = document.getElementById("online").innerHTML;
        temp = temp.substring(temp.indexOf("$") + 1, temp.indexOf("*") - 8);
        temp = parseFloat(temp);
        if (temp > high) {
            high = temp;
        }
    }
    var currency = document.getElementById("altalova").innerHTML;
    currency = currency.substring(currency.indexOf("=") + 2, currency.indexOf("$") + 1);
    var saved = twoDecimal(high - low);
    if (saved > 0) {
        document.getElementById("difference").innerHTML = "*Total Amount Saved= " + currency + saved;
        document.getElementById("difference").classList.remove("invisible");
    }
}

// helper function for two decimal limit
function twoDecimal(number) {
    return Math.round((number) * 100) / 100;
}

// helper function for two decimal limit
function fiveDecimal(number) {
    return number.toFixed(5);
}

// calculates MoneyGram fee to send money from br to us
function brFee(amount, ptax) {
    amount = amount * ptax;
    var fee = 22;
    if (amount > 235 && amount <= 355) {
        fee = 30;
    } else if (amount > 355 && amount <= 465) {
        fee = 34;
    } else if (amount > 465 && amount <= 580) {
        fee = 38;
    } else if (amount > 580 && amount <= 870) {
        fee = 42;
    } else if (amount > 870 && amount <= 1165) {
        fee = 46;
    } else if (amount > 1165 && amount <= 1450) {
        fee = 50;
    } else if (amount > 1450 && amount <= 1740) {
        fee = 54;
    } else if (amount > 1740 && amount <= 2020) {
        fee = 58;
    } else if (amount > 2020 && amount <= 2320) {
        fee = 63;
    } else if (amount > 2320 && amount <= 2900) {
        fee = 72;
    } else if (amount > 2900 && amount <= 3480) {
        fee = 84;
    } else if (amount > 3480 && amount <= 4070) {
        fee = 96;
    } else if (amount > 4070 && amount <= 4650) {
        fee = 108;
    } else if (amount > 4650 && amount <= 5200) {
        fee = 120;
    } else if (amount > 5200 && amount <= 5800) {
        fee = 132;
    } else if (amount > 5800 && amount <= 6380) {
        fee = 144;
    } else if (amount > 6380 && amount <= 6950) {
        fee = 156;
    } else if (amount > 6950 && amount <= 7530) {
        fee = 168;
    } else if (amount > 7530 && amount <= 8100) {
        fee = 180;
    } else if (amount > 8100 && amount <= 8700) {
        fee = 192;
    } else if (amount > 8700 && amount <= 9280) {
        fee = 204;
    } else if (amount > 9280) {
        fee = 216
    }
    return fee / ptax;
}

// calculates MoneyGram fee to send money from us to br
function usFee(amount) {
    var fee = 9.99;
    if (amount >= 1000) {
        fee = 21.20
    }
    if (amount >= 1010) {
        var mult = (amount - 1010) / 10;
        fee += mult * .20;
    }
    return fee;
}

// function fo the flip button, switches origin and recipient and the currencys 
function flip() {
    if (document.getElementById("origin").selectedIndex == "0") {
        document.getElementById("origin").selectedIndex = "1";
    } else if (document.getElementById("origin").selectedIndex == "1") {
        document.getElementById("origin").selectedIndex = "0";
    }

    if (document.getElementById("recipient").selectedIndex == "0") {
        document.getElementById("recipient").selectedIndex = "1";
    } else if (document.getElementById("recipient").selectedIndex == "1") {
        document.getElementById("recipient").selectedIndex = "0";
    }
    updateCurrency();
}

// alterate between currencies 
function updateCurrency() {
    if (document.getElementById("transaction").selectedIndex == "1") {
        var recipient = document.getElementById("recipient").value;
        recipient = recipient.substring(recipient.indexOf("(") + 1, recipient.length - 1);
        document.getElementById("currency").innerHTML = recipient;
    } else {
        var origin = document.getElementById("origin").value;
        origin = origin.substring(origin.indexOf("(") + 1, origin.length - 1);
        document.getElementById("currency").innerHTML = origin;
    }

    if (document.getElementById("currency").innerHTML == "USD") {
        document.getElementById("symbol").innerHTML = "$";
        document.getElementById("fraction").innerHTML = ".00";
    } else {
        document.getElementById("symbol").innerHTML = "R$";
        document.getElementById("fraction").innerHTML = ",00";
    }
    if (document.getElementById("amount").value) {
        outputScript();
    }
}