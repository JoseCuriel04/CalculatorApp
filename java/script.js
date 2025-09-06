document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const historyDisplay = document.getElementById('history-display');
    const historyList = document.getElementById('history-list');
    const buttons = document.querySelectorAll('.btn');
    const toggleDarkMode = document.getElementById('toggle-dark-mode');
    const clearHistoryBtn = document.getElementById('clear-history');
    const saveHistoryPDFBtn = document.getElementById('save-history-pdf');

    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetInput = false;
    let memory = 0;
    let history = [];

    // Cargar historial y modo oscuro
    loadHistory();
    checkDarkMode();

    // Función para actualizar el display
    function updateDisplay() {
        display.textContent = currentInput;
        historyDisplay.textContent = previousInput;
    }

    // Función para agregar al historial
    function addToHistory(expression, result) {
        history.unshift({ expression, result });
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        renderHistory();
    }

    // Función para renderizar el historial
    function renderHistory() {
        historyList.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.expression} = ${item.result}`;
            li.addEventListener('click', () => {
                currentInput = item.result.toString();
                updateDisplay();
            });
            historyList.appendChild(li);
        });
    }

    // Función para cargar el historial
    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            history = JSON.parse(savedHistory);
            renderHistory();
        }
    }

    // Función para limpiar el historial
    function clearHistory() {
        history = [];
        localStorage.removeItem('calculatorHistory');
        renderHistory();
    }

    // Función para factorial
    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    // Función para manejar clics en los botones
    function handleButtonClick(value) {
        if (value === 'clear') {
            currentInput = '0';
            previousInput = '';
            operation = null;
        } else if (value === 'backspace') {
            currentInput = currentInput.slice(0, -1) || '0';
        } else if (value === '=') {
            if (operation && previousInput) {
                try {
                    // Eliminar ceros al inicio para evitar interpretación octal
                    const num1 = previousInput.replace(/^0+/, '') || '0';
                    const num2 = currentInput.replace(/^0+/, '') || '0';
                    const result = eval(num1 + operation + num2);
                    addToHistory(num1 + operation + num2, result);
                    currentInput = result.toString();
                    previousInput = '';
                    operation = null;
                    resetInput = true;
                } catch (error) {
                    currentInput = 'Error';
                }
            }
        } else if (['+', '-', '*', '/', '^', '%'].includes(value)) {
            if (currentInput && !resetInput) {
                previousInput = currentInput;
                operation = value;
                resetInput = true;
            }
        } else if (value === 'pi') {
            currentInput = resetInput ? Math.PI.toString() : currentInput + Math.PI;
            resetInput = false;
        } else if (value === 'e') {
            currentInput = resetInput ? Math.E.toString() : currentInput + Math.E;
            resetInput = false;
        } else if (value === 'factorial') {
            const num = parseFloat(currentInput);
            if (!isNaN(num) && Number.isInteger(num) && num >= 0) {
                currentInput = factorial(num).toString();
            } else {
                currentInput = 'Error';
            }
            resetInput = true;
        } else if (value === 'rand') {
            currentInput = Math.random().toString();
            resetInput = true;
        } else if (value === '10^') {
            currentInput = resetInput ? '10^' : currentInput + '10^';
            resetInput = false;
        } else if (value === 'mc') {
            memory = 0;
        } else if (value === 'mr') {
            currentInput = memory.toString();
            resetInput = true;
        } else if (value === 'm+') {
            memory += parseFloat(currentInput) || 0;
        } else if (value === 'm-') {
            memory -= parseFloat(currentInput) || 0;
        } else {
            currentInput = resetInput ? value : currentInput + value;
            resetInput = false;
        }
        updateDisplay();
    }

    // Función para guardar el historial en PDF
    function saveHistoryToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Historial de Cálculos - CURIEL SCI-CALC", 10, 10);

        let yPosition = 20;
        history.forEach((item, index) => {
            const text = `${index + 1}. ${item.expression} = ${item.result}`;
            doc.text(text, 10, yPosition);
            yPosition += 10;
        });

        doc.save("historial_calculadora.pdf");
    }

    // Event listeners para los botones
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            handleButtonClick(value);
        });
    });

    // Event listener para el teclado físico
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '(', ')', 'Enter', 'Backspace', 'Escape'];
        if (validKeys.includes(key)) {
            e.preventDefault();
            let value;
            if (key === 'Enter') value = '=';
            else if (key === 'Escape') value = 'clear';
            else if (key === 'Backspace') value = 'backspace';
            else value = key;
            handleButtonClick(value);
        }
    });

    // Event listener para el modo oscuro
    toggleDarkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Event listener para limpiar el historial
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Event listener para guardar el historial en PDF
    saveHistoryPDFBtn.addEventListener('click', saveHistoryToPDF);

    // Función para verificar el modo oscuro
    function checkDarkMode() {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
});
