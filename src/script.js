
document.getElementById("btn").addEventListener("click", outputScript);
document.getElementById("img").addEventListener("click", flip);
document.getElementById("transaction").addEventListener("change", updateCurrency);
document.getElementById("origin").addEventListener("change", updateCurrency);
document.getElementById("recipient").addEventListener("change", updateCurrency);

const url = 'https://api.vitortec.com/currency/quotation/v1.2/';
fetch(url)
    .then((resp) => resp.json())
    .then(function (data) {
        let countries = data.data.currency;
        let date = data.data.date;
        date = date.substring(date.indexOf("-") + 1, date.indexOf(" "));

        return countries.map(function (country) {
            let span = document.createElement('span');
            bid = country.buying;
            bid = bid.substring(0, bid.length - 4);
            ask = country.selling;
            ask = ask.substring(0, ask.length - 4);
            if (country.code == "USD") {
                span.innerHTML = `${"BID: " + bid} ${"ASK: " + ask}`;
                document.getElementById('th').innerHTML += "<br>" + date + " (PTAX)";
                document.getElementById('buy').innerHTML = bid;
                document.getElementById('sell').innerHTML = ask;
                document.getElementById('td').innerHTML = span.innerHTML;
            }
        })
    })
    .catch(function (error) {
        console.log(JSON.stringify(error));
    });

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
        getDifference();
    }
}

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

function tableBody(ptax, recipient, transaction) {
    var amount = document.getElementById("amount").value;
    amount = parseFloat(amount);
    var iof = amount * .0038;
    var bankRate = 3.29;
    var wuRate = 3.26;
    var onlineRate = fourDecimal(ptax * 1.0219);
    var bankTotal;
    var wuTotal;
    var onlineTotalUS = twoDecimal(amount + 20);
    var onlineTotalBR = twoDecimal(amount + 62.10 + iof);
    var altalovaTotal = amount + (amount * .03);
    

    if (recipient == "Brazil" && transaction == "send") {
        var bank = "Total Cost= $" + bankTotal + "<br> <i>*Exchange rate offered: " + bankRate + "</i>";
        var wu = "Total Cost= $" + wuTotal + "<br> <i>*Exchange rate offered: " + wuRate + "</i>";
        var online = "Total Cost= $" + onlineTotalUS + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var altalova = "Total Cost= $" + altalovaTotal + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    } else if (recipient == "USA" && transaction == "send") {
        var bank = "Total Cost= R$" + bankTotal + "<br> <i>*Exchange rate offered: " + fourDecimal(bankRate/10) + "</i>";
        var wu = "Total Cost= R$" + wuTotal + "<br> <i>*Exchange rate offered: " + fourDecimal(wuRate/10) + "</i>";
        var online = "Total Cost= R$" + onlineTotalBR + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var altalova = "Total Cost= R$" + altalovaTotal + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    } else if (recipient == "Brazil" && transaction == "recieve") {
        var bank = "Total Cost= $" + twoDecimal((amount/bankRate)) + "<br> <i>*Exchange rate offered: " + bankRate + "</i>";
        var wu = "Total Cost= $" + twoDecimal((amount/wuRate)) + "<br> <i>*Exchange rate offered: " + wuRate + "</i>";
        var online = "Total Cost= $" + twoDecimal((amount/onlineRate + 20)) + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var altalova = "Total Cost= $" + twoDecimal((amount/ptax) * 1.03) + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    } else {
        var bank = "Total Cost= R$" + twoDecimal((amount*bankRate) * 1.0038) + "<br> <i>*Exchange rate offered: " + fourDecimal(bankRate/10) + "</i>";
        var wu = "Total Cost= R$" + twoDecimal(((amount*wuRate) * 1.0038)) + "<br> <i>*Exchange rate offered: " + fourDecimal(wuRate/10) + "</i>";
        var online = "Total Cost= R$" + twoDecimal(((amount*(onlineRate*10)) * 1.0038 + 62.10)) + "<br> <i>*Exchange rate offered: " + onlineRate + "</i>";
        var altalova = "Total Cost= R$" + twoDecimal((amount/ptax + (amount * .03))) + "<br> <i>*Offers the best exchange rate: " + ptax + "</i>";
    }

    document.getElementById("tbody").classList.remove("invisible");
    document.getElementById("banks").innerHTML = bank;
    document.getElementById("ex").innerHTML = wu;
    document.getElementById("online").innerHTML = online;
    document.getElementById("altalova").innerHTML = altalova;
}

function getDifference(){
    var low = document.getElementById("altalova").innerHTML;
    low = low.substring(low.indexOf("$") + 1, low.indexOf("*") - 8);
    low = parseFloat(low);
    var high = document.getElementById("online").innerHTML;
    high = high.substring(high.indexOf("$") + 1, high.indexOf("*") - 8);
    high = parseFloat(high);
    var currency = document.getElementById("altalova").innerHTML;
    currency = currency.substring(currency.indexOf("=") + 2, currency.indexOf("$") + 1);
    var saved = twoDecimal(high - low);
    document.getElementById("difference").innerHTML = "*Total Amount Saved= " + currency + saved;
    document.getElementById("difference").classList.remove("invisible");
}

function twoDecimal(number) {
    return Math.round((number) * 100) / 100;
}

function fourDecimal(number) {
    return number.toFixed(4);
}

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
}