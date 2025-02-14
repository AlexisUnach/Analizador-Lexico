const palabrasReservadas = ["if", "else", "for", "while", "function", "return", "int", "float", "string", "print"];

function analizar() {
    const input = document.getElementById("inputText").value;
    const tokens = input.split(/\s+/);
    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = "";

    tokens.forEach(token => {
        if (token.trim() !== "") {
            const tipo = identificarTipo(token);
            const row = document.createElement("tr");
            row.innerHTML = `<td>${token}</td><td>${tipo}</td>`;
            tableBody.appendChild(row);
        }
    });
}

function identificarTipo(token) {
    if (palabrasReservadas.includes(token)) {
        return "Palabra reservada";
    } else if (/^[a-z][a-zA-Z0-9_]*$/.test(token)) {
        return "Variable";
    } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
        return "Identificador";
    } else if (/^\d+$/.test(token)) {
        return "Número";
    } else if (/^[+\-*/=<>!&|^%]+$/.test(token)) {
        return "Operador";
    } else {
        return "Desconocido";
    }
}