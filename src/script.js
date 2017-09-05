
document.getElementById("btn").addEventListener("click", outputScript);
document.getElementById("img").addEventListener("click", update);
document.getElementById("transaction").addEventListener("change", updateCurrency);
document.getElementById("origin").addEventListener("change", updateCurrency);
document.getElementById("recipient").addEventListener("change", updateCurrency);


var output = document.getElementById("root");

var rate = "3.1253";
var bank = "$____";
var online = "$____";
var altalova = "$____";

function outputScript() {
    var origin = document.getElementById("origin").value;
    origin = origin.substring(0, origin.length - 6);
    var recipient = document.getElementById("recipient").value;
    recipient = recipient.substring(0, recipient.length - 6);
    var transaction = document.getElementById("transaction").value;
    var amount = document.getElementById("amount").value;
    var currency = document.getElementById("currency").innerHTML;
    var fraction = document.getElementById("fraction").innerHTML;
    var direction;
    if (transaction == "send") {
        direction = " to ";
    } else {
        direction = " in ";
    }
    var phrase = "<b>Cost to " + transaction + " " + amount + fraction + " " + currency + " from " + origin + direction + recipient + ":</b>";

    if (!amount) {
        output.innerHTML = "<b>Please input an amount!</b>"
    } else if (amount < 1) {
        output.innerHTML = "<b>Please input an amount above 1 dollar.</b>"
    } else if (amount >= 5000 && currency == "USD") {
        output.innerHTML = "<b>Please input an amount lower than $5,000</b>"
    } else if (amount >= 20000 && currency == "BRL") {
        output.innerHTML = "<b>Please input an amount lower than R$20.000</b>"
    } else {
        output.innerHTML = phrase;
        output.appendChild(document.createElement("br"));
        output.innerHTML += '<li>Exchange Rate: ' + rate + '</li>';
        output.innerHTML += '<li>Banks: ' + bank + '</li>';
        output.innerHTML += '<li>Online: ' + online + '</li>';
        output.innerHTML += '<li>Altalova: ' + altalova + '</li>';
    }
}

function update() {
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