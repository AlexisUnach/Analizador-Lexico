const palabrasReservadas = ["if", "else", "for", "while", "function", "return", "print", "in", "range"];

function analizarLexico(input) {
    try {
        console.log("Iniciando análisis léxico...");
        const lineas = input.split("\n");
        const resultados = [];

        lineas.forEach((linea, index) => {
            const sinComentario = linea.split("#")[0].trim();
            if (sinComentario === "") {
                return;
            }

            const tokens = [];
            let restante = sinComentario;
            let iteraciones = 0;
            const maxIteraciones = 1000;

            while (restante.length > 0) {
                iteraciones++;
                if (iteraciones > maxIteraciones) {
                    console.error(`Bucle infinito detectado en analizarLexico, línea ${index + 1}. Restante: "${restante}"`);
                    break;
                }

                restante = restante.trim();
                if (restante === "") break;

                const correoMatch = restante.match(/^[a-zA-Z0-9._%+-]+@[\w.-]*\.?[\w]*/);
                if (correoMatch) {
                    tokens.push(correoMatch[0]);
                    restante = restante.substring(correoMatch[0].length);
                    continue;
                }

                const tokenMatch = restante.match(
                    /"[^"]*"|[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+[a-zA-Z_]*|[=+\-*/><!&|^%+]+|[():{}@.]|\S/
                );
                if (tokenMatch) {
                    tokens.push(tokenMatch[0]);
                    restante = restante.substring(tokenMatch[0].length);
                } else {
                    restante = restante.substring(1);
                }
            }

            const lineaTokens = [];
            tokens.forEach(token => {
                if (token.trim() !== "") {
                    const tipo = identificarTipo(token);
                    lineaTokens.push({ token, tipo, linea: index + 1 });
                }
            });

            resultados.push(...lineaTokens);
        });

        console.log("Análisis léxico completado:", resultados);
        return resultados;
    } catch (error) {
        console.error("Error en analizarLexico():", error);
        throw error;
    }
}

function identificarTipo(token) {
    if (/^[a-zA-Z0-9._%+-]+@[\w.-]*\.?[\w]*$/.test(token)) {
        return "Correo";
    }
    else if (palabrasReservadas.includes(token)) {
        return "Palabra reservada";
    }
    else if (/^[a-z][a-zA-Z0-9_]*$/.test(token)) {
        return "Variable";
    }
    else if (/^[0-9]+$/.test(token)) {
        return "Número";
    }
    else if (/^[=+\-*/><!&|^%+]+$/.test(token)) {
        return "Operador";
    }
    else if (/^[():{}@.]$/.test(token)) {
        return "Símbolo";
    }
    else if (/^".*"$/.test(token)) {
        return "Cadena";
    }
    else if (/^[0-9]+[a-zA-Z_]*$/.test(token)) {
        return "VariableInválida";
    }
    else {
        return "Desconocido";
    }
}