import React, { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';

interface CalculatorProps {
  mode: 'SETUP' | 'USAGE';
  onSetCode?: (code: string) => void;
  onUnlockAttempt?: (value: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ mode, onSetCode, onUnlockAttempt }) => {
  const [display, setDisplay] = useState(mode === 'SETUP' ? 'SET PIN' : '0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isError, setIsError] = useState(false);

  // Clear "SET PIN" on first interaction
  const [touched, setTouched] = useState(mode === 'USAGE');

  useEffect(() => {
    if (mode === 'SETUP') {
      setDisplay('SET PIN');
      setTouched(false);
    } else {
      setDisplay('0');
      setTouched(true);
    }
  }, [mode]);

  const handleInput = (val: string) => {
    if (!touched) {
      setTouched(true);
      setDisplay(val);
      return;
    }

    if (waitingForOperand) {
      setDisplay(val);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' || display === 'SET PIN' ? val : display + val);
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(display);
    } else if (operator) {
      const currentValue = prevValue || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, operator);
      setPrevValue(String(newValue));
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (first: number, second: number, op: string) => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '×': return first * second;
      case '÷': return first / second;
      default: return second;
    }
  };

  const handleEquals = () => {
    if (mode === 'SETUP') {
      if (onSetCode && touched && display !== 'SET PIN') {
        onSetCode(display);
        // Briefly show confirmation
        setDisplay('SAVED');
        setTimeout(() => setDisplay('0'), 1000);
      }
      return;
    }

    // Check for unlock code BEFORE doing math
    if (onUnlockAttempt) {
      onUnlockAttempt(display);
    }

    // Perform math
    if (operator && prevValue !== null) {
      const result = calculate(parseFloat(prevValue), parseFloat(display), operator);
      setDisplay(String(result));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setIsError(false);
    if (mode === 'SETUP' && !touched) {
        setDisplay('SET PIN');
    }
  };

  const handleDelete = () => {
    if (display === 'SET PIN' || display === 'SAVED') return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const btnClass = (color: 'gray' | 'orange' | 'dark', wide = false) => `
    h-16 ${wide ? 'col-span-2 rounded-full pl-6 text-left' : 'w-16 h-16 rounded-full'} 
    flex items-center justify-center text-3xl font-medium transition-all active:scale-95
    ${color === 'gray' ? 'bg-slate-300 text-black hover:bg-slate-200' : ''}
    ${color === 'orange' ? 'bg-orange-500 text-white hover:bg-orange-400' : ''}
    ${color === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}
  `;

  return (
    <div className="w-full max-w-sm mx-auto bg-black p-5 rounded-3xl shadow-2xl border border-slate-900">
      {/* Display */}
      <div className="h-24 flex items-end justify-end mb-4 px-2">
        <span className={`text-5xl font-light text-white tracking-tight truncate ${display === 'SET PIN' ? 'animate-pulse text-emerald-500' : ''}`}>
          {display}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3">
        <button className={btnClass('gray')} onClick={handleClear}>{display === '0' || display === 'SET PIN' ? 'AC' : 'C'}</button>
        <button className={btnClass('gray')} onClick={() => { setDisplay(String(parseFloat(display) * -1)) }}>+/-</button>
        <button className={btnClass('gray')} onClick={() => { setDisplay(String(parseFloat(display) / 100)) }}>%</button>
        <button className={btnClass('orange')} onClick={() => performOperation('÷')}>÷</button>

        <button className={btnClass('dark')} onClick={() => handleInput('7')}>7</button>
        <button className={btnClass('dark')} onClick={() => handleInput('8')}>8</button>
        <button className={btnClass('dark')} onClick={() => handleInput('9')}>9</button>
        <button className={btnClass('orange')} onClick={() => performOperation('×')}>×</button>

        <button className={btnClass('dark')} onClick={() => handleInput('4')}>4</button>
        <button className={btnClass('dark')} onClick={() => handleInput('5')}>5</button>
        <button className={btnClass('dark')} onClick={() => handleInput('6')}>6</button>
        <button className={btnClass('orange')} onClick={() => performOperation('-')}>-</button>

        <button className={btnClass('dark')} onClick={() => handleInput('1')}>1</button>
        <button className={btnClass('dark')} onClick={() => handleInput('2')}>2</button>
        <button className={btnClass('dark')} onClick={() => handleInput('3')}>3</button>
        <button className={btnClass('orange')} onClick={() => performOperation('+')}>+</button>

        <button className={btnClass('dark', true)} onClick={() => handleInput('0')}>0</button>
        <button className={btnClass('dark')} onClick={() => handleInput('.')}>.</button>
        <button className={btnClass('orange')} onClick={handleEquals}>=</button>
      </div>
    </div>
  );
};