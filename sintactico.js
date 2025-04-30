const operadoresComparacion = ["==", "!=", "<", ">", "<=", ">="];
const operadoresAsignacionCompuesta = ["+=", "-=", "*=", "/="];

function analizarSintactico(tokens) {
    try {
        console.log("Iniciando análisis sintáctico...");
        if (tokens.length === 0) {
            return "No hay código para analizar.";
        }

        let errores = [];
        let lineaTokens = [];
        let lineaActual = tokens[0].linea;

        for (let j = 0; j <= tokens.length; j++) {
            if (j === tokens.length || tokens[j].linea !== lineaActual) {
                if (lineaTokens.length > 0) {
                    const resultado = analizarLinea(lineaTokens, lineaActual);
                    if (typeof resultado === "string") {
                        errores.push(resultado);
                    } else if (Array.isArray(resultado) && resultado.length > 0) {
                        errores.push(...resultado);
                    }
                }
                lineaTokens = [];
                if (j < tokens.length) {
                    lineaActual = tokens[j].linea;
                    lineaTokens.push(tokens[j]);
                }
            } else {
                lineaTokens.push(tokens[j]);
            }
        }

        const erroresSemanticos = analizarSemantico(tokens);
        if (erroresSemanticos.length > 0) {
            errores.push(...erroresSemanticos);
        }

        console.log("Análisis sintáctico completado:", errores.length > 0 ? errores : "Éxito");
        if (errores.length > 0) {
            return errores.join("\n");
        }
        return "Análisis sintáctico y semántico exitoso";
    } catch (error) {
        console.error("Error en analizarSintactico():", error);
        return "Error interno en el análisis sintáctico. Revisa la consola para más detalles.";
    }
}

function analizarLinea(tokens, linea) {
    let i = 0;
    let errores = [];

    while (i < tokens.length) {
        const token = tokens[i].token;
        let resultado;

        if (palabrasReservadas.includes(token.toLowerCase())) {
            if (token.toLowerCase() === "print") {
                resultado = esPrint();
            } else if (token.toLowerCase() === "if") {
                resultado = esCondicional();
            } else if (token.toLowerCase() === "while") {
                resultado = esWhile();
            } else if (token.toLowerCase() === "for") {
                resultado = esForPython();
            } else {
                resultado = `Error en línea ${linea}: Palabra reservada '${token}' no soportada en este contexto.`;
            }
        } else if (tokens[i].tipo === "Variable" || tokens[i].tipo === "VariableInválida") {
            resultado = esAsignacion();
        } else if (tokens[i].tipo === "Correo") {
            resultado = esCorreo();
        } else if (tokens[i].tipo === "Cadena" || tokens[i].tipo === "Número") {
            resultado = esExpresion();
        } else {
            resultado = `Error en línea ${linea}: Token inesperado "${token}". No sigue una estructura válida de Python.`;
        }

        if (resultado === true) {
            break;
        } else if (typeof resultado === "string") {
            errores.push(resultado);
            break;
        } else {
            errores.push(`Error en línea ${linea}: No se pudo analizar el token "${token}". Estructura desconocida o no soportada.`);
            break;
        }
    }

    return errores;

    function esAsignacion() {
        if (i + 2 < tokens.length &&
            (tokens[i].tipo === "Variable" || tokens[i].tipo === "VariableInválida")) {
            const operador = tokens[i + 1].token;
            const valor = tokens[i + 2];

            // Validar si es una asignación simple o compuesta
            if (operador === "=" || operadoresAsignacionCompuesta.includes(operador)) {
                if (tokens[i].tipo === "VariableInválida") {
                    return `Error en línea ${linea}: Estructura 'asignación' incorrecta. La variable '${tokens[i].token}' no puede empezar con un número.`;
                }
                // Para asignaciones simples (=), aceptamos número, cadena o correo
                if (operador === "=") {
                    if (valor.tipo === "Número" || valor.tipo === "Cadena" || valor.tipo === "Correo") {
                        i += 2;
                        return true;
                    } else {
                        return `Error en línea ${linea}: Estructura 'asignación' incorrecta. Se esperaba: 'variable = <número, cadena o correo>', pero se encontró: '${valor.token}'`;
                    }
                }
                // Para asignaciones compuestas (+=, -=, etc.), solo aceptamos números
                else if (operadoresAsignacionCompuesta.includes(operador)) {
                    if (valor.tipo === "Número") {
                        i += 2;
                        return true;
                    } else {
                        return `Error en línea ${linea}: Estructura 'asignación compuesta' incorrecta. Se esperaba: 'variable ${operador} <número>', pero se encontró: '${valor.token}'`;
                    }
                }
            }
        } else if (i + 1 < tokens.length && (tokens[i].tipo === "Variable" || tokens[i].tipo === "VariableInválida")) {
            if (tokens[i].tipo === "VariableInválida") {
                return `Error en línea ${linea}: Estructura 'asignación' incorrecta. La variable '${tokens[i].token}' no puede empezar con un número.`;
            }
            return `Error en línea ${linea}: Estructura 'asignación' incorrecta. Se esperaba: 'variable = <número, cadena o correo>'`;
        }
        return `Error en línea ${linea}: Estructura 'asignación' incorrecta. Se esperaba: 'variable = <número, cadena o correo>'`;
    }

    function esCondicional() {
        if ((tokens[i].tipo === "Palabra reservada" || tokens[i].tipo === "Desconocido") && tokens[i].token.toLowerCase() === "if") {
            if (tokens[i].token !== "if") {
                return `Error en línea ${linea}: Uso incorrecto de mayúsculas en la palabra reservada '${tokens[i].token}'. Debe ser 'if' en minúsculas.`;
            }
            if (i + 4 < tokens.length &&
                (tokens[i + 1].tipo === "Variable" || tokens[i + 1].tipo === "Número") &&
                operadoresComparacion.includes(tokens[i + 2].token) &&
                (tokens[i + 3].tipo === "Variable" || tokens[i + 3].tipo === "Número") &&
                tokens[i + 4].token === ":") {
                if (tokens[i + 1].tipo === "VariableInválida") {
                    return `Error en línea ${linea}: La variable '${tokens[i + 1].token}' no puede empezar con un número.`;
                }
                if (tokens[i + 3].tipo === "VariableInválida") {
                    return `Error en línea ${linea}: La variable '${tokens[i + 3].token}' no puede empezar con un número.`;
                }
                i += 4;
                return true;
            }
            if (i + 2 < tokens.length && tokens[i].token === "if" && tokens[i + 2].token === "=") {
                return `Error en línea ${linea}: Se usó '=' en lugar de un operador de comparación (como '==') en la condición del 'if'.`;
            }
            return `Error en línea ${linea}: Estructura 'if' incorrecta. Se esperaba: 'if <condición> :' con un operador de comparación (==, !=, <, >, <=, >=).`;
        }
        return `Error en línea ${linea}: Estructura 'if' incorrecta. Se esperaba: 'if <condición> :'`;
    }

    function esWhile() {
        if ((tokens[i].tipo === "Palabra reservada" || tokens[i].tipo === "Desconocido") && tokens[i].token.toLowerCase() === "while") {
            if (tokens[i].token !== "while") {
                return `Error en línea ${linea}: Uso incorrecto de mayúsculas en la palabra reservada '${tokens[i].token}'. Debe ser 'while' en minúsculas.`;
            }
            if (i + 4 < tokens.length &&
                (tokens[i + 1].tipo === "Variable" || tokens[i + 1].tipo === "Número") &&
                operadoresComparacion.includes(tokens[i + 2].token) &&
                (tokens[i + 3].tipo === "Variable" || tokens[i + 3].tipo === "Número") &&
                tokens[i + 4].token === ":") {
                if (tokens[i + 1].tipo === "VariableInválida") {
                    return `Error en línea ${linea}: La variable '${tokens[i + 1].token}' no puede empezar con un número.`;
                }
                if (tokens[i + 3].tipo === "VariableInválida") {
                    return `Error en línea ${linea}: La variable '${tokens[i + 3].token}' no puede empezar con un número.`;
                }
                i += 4;
                return true;
            }
            if (i + 2 < tokens.length && tokens[i].token === "while" && tokens[i + 2].token === "=") {
                return `Error en línea ${linea}: Se usó '=' en lugar de un operador de comparación (como '==') en la condición del 'while'.`;
            }
            return `Error en línea ${linea}: Estructura 'while' incorrecta. Se esperaba: 'while <condición> :' con un operador de comparación (==, !=, <, >, <=, >=).`;
        }
        return `Error en línea ${linea}: Estructura 'while' incorrecta. Se esperaba: 'while <condición> :'`;
    }

    function esForPython() {
        if ((tokens[i].tipo === "Palabra reservada" || tokens[i].tipo === "Desconocido") && tokens[i].token.toLowerCase() === "for") {
            if (tokens[i].token !== "for") {
                return `Error en línea ${linea}: Uso incorrecto de mayúsculas en la palabra reservada '${tokens[i].token}'. Debe ser 'for' en minúsculas.`;
            }
            if (i + 7 < tokens.length &&
                tokens[i + 1].tipo === "Variable" &&
                tokens[i + 2].token === "in" &&
                tokens[i + 3].token === "range" &&
                tokens[i + 4].token === "(" &&
                tokens[i + 5].tipo === "Número" &&
                tokens[i + 6].token === ")" &&
                tokens[i + 7].token === ":") {
                if (tokens[i + 1].tipo === "VariableInválida") {
                    return `Error en línea ${linea}: La variable '${tokens[i + 1].token}' no puede empezar con un número.`;
                }
                i += 7;
                return true;
            }
            return `Error en línea ${linea}: Estructura 'for' incorrecta. Se esperaba: 'for <var> in range(<número>) :'`;
        }
        return `Error en línea ${linea}: Estructura 'for' incorrecta. Se esperaba: 'for <var> in range(<número>) :'`;
    }

    function esPrint() {
        if ((tokens[i].tipo === "Palabra reservada" || tokens[i].tipo === "Desconocido") && tokens[i].token.toLowerCase() === "print") {
            if (tokens[i].token !== "print") {
                return `Error en línea ${linea}: Uso incorrecto de mayúsculas en la palabra reservada '${tokens[i].token}'. Debe ser 'print' en minúsculas.`;
            }
            if (i + 1 >= tokens.length || tokens[i + 1].token !== "(") {
                return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena, variable o correo>)'`;
            }

            let j = i + 1;
            if (j + 1 >= tokens.length) {
                return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena, variable o correo>)'`;
            }

            if (tokens[j + 1].token === ")") {
                i = j + 1;
                return true;
            }

            j += 1;
            while (j < tokens.length && tokens[j].token !== ")") {
                if (tokens[j].tipo === "Cadena" || tokens[j].tipo === "Variable" || tokens[j].tipo === "Número" || tokens[j].tipo === "Correo") {
                    if (tokens[j].tipo === "VariableInválida") {
                        return `Error en línea ${linea}: La variable '${tokens[j].token}' no puede empezar con un número.`;
                    }
                    j++;
                } else if (tokens[j].token === ",") {
                    j++;
                } else {
                    return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena, variable o correo>)', pero se encontró: '${tokens[j].token}'`;
                }
            }

            if (j < tokens.length && tokens[j].token === ")") {
                i = j;
                return true;
            }
            return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena, variable o correo>)'`;
        }
        return `Error en línea ${linea}: Estructura 'print' incorrecta. Se esperaba: 'print(<cadena, variable o correo>)'`;
    }

    function esCorreo() {
        if (tokens[i].tipo !== "Correo") {
            return `Error en línea ${linea}: Token '${tokens[i].token}' no es un correo válido.`;
        }

        const correo = tokens[i].token;
        const partes = correo.split("@");

        if (partes.length !== 2) {
            return `Error en línea ${linea}: Estructura 'correo' incorrecta. Se esperaba: 'usuario@dominio.extensión'. Falta el símbolo '@'.`;
        }

        const usuario = partes[0];
        const dominioExtension = partes[1];

        if (!usuario) {
            return `Error en línea ${linea}: Estructura 'correo' incorrecta. Se esperaba: 'usuario@dominio.extensión'. Falta la parte 'usuario'.`;
        }

        if (!dominioExtension) {
            return `Error en línea ${linea}: Estructura 'correo' incorrecta. Se esperaba: 'usuario@dominio.extensión'. Falta la parte 'dominio'.`;
        }

        const dominioPartes = dominioExtension.split(".");
        if (dominioPartes.length < 2) {
            return `Error en línea ${linea}: Estructura 'correo' incorrecta. Se esperaba: 'usuario@dominio.extensión'. Falta el '.' o la extensión.`;
        }

        const dominio = dominioPartes[0];
        const extension = dominioPartes[1];

        if (!dominio) {
            return `Error en línea ${linea}: Estructura 'correo' incorrecta. Se esperaba: 'usuario@dominio.extensión'. Falta la parte 'dominio'.`;
        }

        if (!extension) {
            return `Error en línea ${linea}: Estructura 'correo' incorrecta. Se esperaba: 'usuario@dominio.extensión'. Falta la parte 'extensión'.`;
        }

        return true;
    }

    function esExpresion() {
        if (i + 2 < tokens.length &&
            (tokens[i].tipo === "Cadena" || tokens[i].tipo === "Número" || tokens[i].tipo === "Variable") &&
            tokens[i + 1].token === "+" &&
            (tokens[i + 2].tipo === "Cadena" || tokens[i + 2].tipo === "Número" || tokens[i + 2].tipo === "Variable")) {
            if (tokens[i].tipo === "VariableInválida") {
                return `Error en línea ${linea}: La variable '${tokens[i].token}' no puede empezar con un número.`;
            }
            if (tokens[i + 2].tipo === "VariableInválida") {
                return `Error en línea ${linea}: La variable '${tokens[i + 2].token}' no puede empezar con un número.`;
            }
            i += 2;
            return true;
        }
        return `Error en línea ${linea}: Estructura 'expresión' incorrecta. Se esperaba: '<valor> + <valor>'`;
    }
}

function analizarSemantico(tokens) {
    const errores = [];

    for (let i = 0; i < tokens.length - 2; i++) {
        if (tokens[i + 1].token === "+") {
            const operando1 = tokens[i];
            const operando2 = tokens[i + 2];
            if ((operando1.tipo === "Cadena" && operando2.tipo === "Número") ||
                (operando1.tipo === "Número" && operando2.tipo === "Cadena")) {
                errores.push(`Error semántico en línea ${operando1.linea}: No se puede sumar una cadena ('${operando1.token}') con un número ('${operando2.token}').`);
            }
        }
    }

    return errores;
}

function analizar() {
    try {
        console.log("Botón 'Analizar Código' clicado");
        const input = document.getElementById("inputText");
        if (!input) {
            throw new Error("No se encontró el elemento '#inputText'");
        }
        const inputValue = input.value;
        if (!inputValue.trim()) {
            const resultadoDiv = document.getElementById("sintacticoResult");
            if (!resultadoDiv) {
                throw new Error("No se encontró el elemento '#sintacticoResult'");
            }
            resultadoDiv.textContent = "Error: Ingresa código para analizar.";
            resultadoDiv.classList.add("error");
            alert("Hay algo mal en el código.");
            const continuar = confirm("¿Desea continuar con el análisis?");
            if (!continuar) return;
        }

        // Realizar el análisis léxico
        const tokens = analizarLexico(inputValue + "\n");

        // Llenar la tabla léxica
        const lexicoTableBody = document.querySelector("#lexicoTable tbody");
        if (!lexicoTableBody) {
            throw new Error("No se encontró el elemento '#lexicoTable tbody'");
        }
        lexicoTableBody.innerHTML = "";
        tokens.forEach(token => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${token.token}</td><td>${token.tipo}</td>`;
            lexicoTableBody.appendChild(row);
        });

        // Realizar el análisis sintáctico
        const resultadoSintactico = analizarSintactico(tokens);

        // Verificar si hay errores
        const resultadoDiv = document.getElementById("sintacticoResult");
        if (!resultadoDiv) {
            throw new Error("No se encontró el elemento '#sintacticoResult'");
        }

        if (resultadoSintactico.includes("Error")) {
            // Si hay errores, mostrar la alerta y preguntar
            alert("Hay algo mal en el código.");
            const mostrarResultados = confirm("¿Desea ver los resultados del análisis?");
            if (mostrarResultados) {
                resultadoDiv.textContent = resultadoSintactico;
                resultadoDiv.classList.add("error");
            } else {
                resultadoDiv.textContent = "Análisis detenido por el usuario.";
                resultadoDiv.classList.add("error");
            }
        } else {
            // Si no hay errores, mostrar el resultado directamente
            resultadoDiv.textContent = resultadoSintactico;
            resultadoDiv.classList.remove("error");
        }
    } catch (error) {
        console.error("Error en analizar():", error);
        alert("Ocurrió un error al analizar el código. Revisa la consola para más detalles.");
    }
}