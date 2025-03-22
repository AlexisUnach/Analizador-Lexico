// Lista de operadores de comparación válidos
const operadoresComparacion = ["==", "!=", "<", ">", "<=", ">="];

function analizarSintactico(tokens) {
    if (tokens.length === 0) {
        return "No hay código para analizar.";
    }

    let i = 0;
    let errores = [];

    // Agrupar tokens por línea
    let lineaTokens = [];
    let lineaActual = tokens[0].linea;

    for (let j = 0; j <= tokens.length; j++) {
        if (j === tokens.length || tokens[j].linea !== lineaActual) {
            // Analizar los tokens de la línea actual
            if (lineaTokens.length > 0) {
                const resultado = analizarLinea(lineaTokens, lineaActual);
                if (resultado !== true) {
                    errores.push(resultado);
                }
            }
            // Preparar la siguiente línea
            lineaTokens = [];
            if (j < tokens.length) {
                lineaActual = tokens[j].linea;
                lineaTokens.push(tokens[j]);
            }
        } else {
            lineaTokens.push(tokens[j]);
        }
    }

    if (errores.length > 0) {
        return errores.join("\n");
    }
    return "Análisis sintáctico exitoso";
}

function analizarLinea(tokens, linea) {
    let i = 0;

    function siguiente() {
        i++;
        return i < tokens.length;
    }

    function tokenActual() {
        return tokens[i] ? tokens[i].token : "fin de línea";
    }

    // Verifica una asignación: Variable = Valor o Variable += Valor
    // Función esAsignacion() modificada
function esAsignacion() {
    if (i + 2 < tokens.length &&
        tokens[i].tipo === "Variable" &&
        (tokens[i + 1].token === "=" || tokens[i + 1].token === "+=")) {
        
        const valor = tokens[i + 2];
        
        if (valor.tipo === "Número" || valor.tipo === "Cadena") {
            i += 3;
            return true;
        } else if (valor.tipo === "Variable") {
            return `Error en línea ${linea}: Estructura 'asignación' incorrecta. Se esperaba: 'variable = <número o cadena>'`;
        } else {
            return `Error en línea ${linea}: Estructura 'asignación' incorrecta. Se esperaba: 'variable = <número o cadena>'`;
        }
    } else if (i + 1 < tokens.length && tokens[i].tipo === "Variable" && (tokens[i + 1].token === "=" || tokens[i + 1].token === "+=")) {
        return `Error en línea ${linea}: Estructura 'asignación' incorrecta. Se esperaba: 'variable = <número o cadena>'`;
    }
    return false;
}

    // Verifica un condicional if: if Variable/Número OperadorComparacion Variable/Número :
    function esCondicional() {
        if (i + 4 < tokens.length &&
            tokens[i].token === "if" &&
            (tokens[i + 1].tipo === "Variable" || tokens[i + 1].tipo === "Número") &&
            operadoresComparacion.includes(tokens[i + 2].token) &&  // Solo operadores de comparación
            (tokens[i + 3].tipo === "Variable" || tokens[i + 3].tipo === "Número") &&
            tokens[i + 4].token === ":") {
            i += 5;
            return true;
        }
        // Detectar específicamente el uso de "="
        if (tokens[i].token === "if" && i + 2 < tokens.length && tokens[i + 2].token === "=") {
            return `Error en línea ${linea}: Se usó '=' en lugar de un operador de comparación (como '==') en la condición del 'if'.`;
        }
        if (tokens[i].token === "if") {
            return `Error en línea ${linea}: Estructura 'if' incorrecta. Se esperaba: 'if <condición> :' con un operador de comparación (==, !=, <, >, <=, >=).`;
        }
        return false;
    }

    // Verifica un bucle while: while Variable/Número OperadorComparacion Variable/Número :
    function esWhile() {
        if (i + 4 < tokens.length &&
            tokens[i].token === "while" &&
            (tokens[i + 1].tipo === "Variable" || tokens[i + 1].tipo === "Número") &&
            operadoresComparacion.includes(tokens[i + 2].token) &&  // Solo operadores de comparación
            (tokens[i + 3].tipo === "Variable" || tokens[i + 3].tipo === "Número") &&
            tokens[i + 4].token === ":") {
            i += 5;
            return true;
        }
        // Detectar específicamente el uso de "="
        if (tokens[i].token === "while" && i + 2 < tokens.length && tokens[i + 2].token === "=") {
            return `Error en línea ${linea}: Se usó '=' en lugar de un operador de comparación (como '==') en la condición del 'while'.`;
        }
        if (tokens[i].token === "while") {
            return `Error en línea ${linea}: Estructura 'while' incorrecta. Se esperaba: 'while <condición> :' con un operador de comparación (==, !=, <, >, <=, >=).`;
        }
        return false;
    }

    // Verifica un bucle for estilo Python: for Variable in range(Número) :
    function esForPython() {
        if (i + 7 < tokens.length &&
            tokens[i].token === "for" &&
            tokens[i + 1].tipo === "Variable" &&
            tokens[i + 2].token === "in" &&
            tokens[i + 3].token === "range" &&
            tokens[i + 4].token === "(" &&
            tokens[i + 5].tipo === "Número" &&
            tokens[i + 6].token === ")" &&
            tokens[i + 7].token === ":") {
            i += 8;
            return true;
        }
        if (tokens[i].token === "for") {
            return `Error en línea ${linea}: Estructura 'for' incorrecta. Se esperaba: 'for <var> in range(<número>) :'`;
        }
        return false;
    }

    // Verifica una instrucción print: print(Cadena) o print(Variable) o print(Cadena, Variable)
    function esPrint() {
        if (tokens[i].token === "print") {
            if (i + 1 >= tokens.length || tokens[i + 1].token !== "(") {
                return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena o variable>)'`;
            }
    
            i += 2;
            
            if (i >= tokens.length) {
                return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena o variable>)'`;
            }
            
            if (tokens[i].token === ")") {
                i++;
                return true;
            }
    
            while (i < tokens.length && tokens[i].token !== ")") {
                if (tokens[i].tipo === "Cadena" || tokens[i].tipo === "Variable" || tokens[i].tipo === "Número") {
                    i++;
                } else if (tokens[i].token === ",") {
                    i++;
                } else {
                    return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena o variable>)'`;
                }
            }
    
            if (i < tokens.length && tokens[i].token === ")") {
                i++;
                return true;
            } else {
                return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena o variable>)'`;
            }
        }
        return false;
    }

    // Análisis de la línea
    while (i < tokens.length) {
        const token = tokenActual();

        // Intentar identificar la estructura basada en el token actual
        let resultado;
        
        if (token === "print") {
            resultado = esPrint();
            if (resultado === true) {
                continue;
            } else if (typeof resultado === "string") {
                return resultado;
            }
        } else if (token === "if") {
            resultado = esCondicional();
            if (resultado === true) {
                continue;
            } else if (typeof resultado === "string") {
                return resultado;
            }
        } else if (token === "while") {
            resultado = esWhile();
            if (resultado === true) {
                continue;
            } else if (typeof resultado === "string") {
                return resultado;
            }
        } else if (token === "for") {
            resultado = esForPython();
            if (resultado === true) {
                continue;
            } else if (typeof resultado === "string") {
                return resultado;
            }
        } else if (tokens[i].tipo === "Variable") {
            resultado = esAsignacion();
            if (resultado === true) {
                continue;
            } else if (typeof resultado === "string") {
                return resultado;
            }
        }
        
        // Si ninguna estructura coincide, devolver un error específico según el caso
        if (tokens[i].tipo === "Variable") {
            return `Error en línea ${linea}: Estructura incorrecta que comienza con la variable "${token}". Las variables solo pueden usarse en asignaciones (variable = valor) o dentro de otras estructuras.`;
        } else {
            return `Error en línea ${linea}: Token inesperado "${token}". No sigue una estructura válida de Python.`;
        }
    }

    return true;
}

function analizar() {
    const input = document.getElementById("inputText").value;
    if (!input.trim()) {
        document.getElementById("sintacticoResult").textContent = "Error: Ingresa código para analizar.";
        document.getElementById("sintacticoResult").classList.add("error");
        return;
    }

    const tokens = analizarLexico(input + "\n");
    const lexicoTableBody = document.querySelector("#lexicoTable tbody");
    lexicoTableBody.innerHTML = "";
    tokens.forEach(token => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${token.token}</td><td>${token.tipo}</td>`;
        lexicoTableBody.appendChild(row);
    });

    const resultadoSintactico = analizarSintactico(tokens);
    const resultadoDiv = document.getElementById("sintacticoResult");
    resultadoDiv.textContent = resultadoSintactico;
    if (resultadoSintactico.includes("Error")) {
        resultadoDiv.classList.add("error");
    } else {
        resultadoDiv.classList.remove("error");
    }
}