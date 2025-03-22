const palabrasReservadas = ["if", "else", "for", "while", "function", "return", "print", "in", "range"];

function analizarLexico(input) {
    const lineas = input.split("\n");
    const resultados = [];

    lineas.forEach((linea, index) => {
        // Ignorar todo lo que viene después de un # (comentario)
        const sinComentario = linea.split("#")[0].trim();
        if (sinComentario === "") {
            // Si la línea solo tiene comentario o está vacía, no añadimos tokens
            return;
        }

        // Reconocer tokens en la línea sin comentario
        const tokens = sinComentario.match(/"[^"]*"|[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+|[=+\-*/><!&|^%+]+|[():{}]|\S/g) || [];
        const lineaTokens = [];
        tokens.forEach(token => {
            if (token.trim() !== "") {
                const tipo = identificarTipo(token);
                lineaTokens.push({ token, tipo, linea: index + 1 });
            }
        });

        // Añadir los tokens de la línea a los resultados
        resultados.push(...lineaTokens);
    });

    return resultados;
}

function identificarTipo(token) {
    if (palabrasReservadas.includes(token)) {
        return "Palabra reservada";
    } else if (/^[a-z][a-zA-Z0-9_]*$/.test(token)) {
        return "Variable";
    } else if (/^[0-9]+$/.test(token)) {
        return "Número";
    } else if (/^[=+\-*/><!&|^%+]+$/.test(token)) {
        return "Operador";
    } else if (/^[():{}]$/.test(token)) {
        return "Símbolo";
    } else if (/^".*"$/.test(token)) {
        return "Cadena";
    } else {
        return "Desconocido";
    }
}