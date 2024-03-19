import React, { useState } from "react";
import './App.css';

function Knapsack() {
    const [items, setItems] = useState([]);
    const [capacity, setCapacity] = useState('');
    const [itemWeight, setItemWeight] = useState('');
    const [itemValue, setItemValue] = useState('');
    const [executionTime, setExecutionTime] = useState(null);
    const [knapsackResult, setKnapsackResult] = useState(null);

    const addItem = () => {
        const newItems = [...items, { weight: parseInt(itemWeight), value: parseInt(itemValue) }];
        setItems(newItems);
        setItemWeight('');
        setItemValue('');
    };

    const deleteItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const knapsackRecursive = (weights, values, capacity, n) => {
        if (capacity === 0 || n === 0) {
            return { value: 0, weight: 0, items: [] };
        }

        if (weights[n - 1] > capacity) {
            return knapsackRecursive(weights, values, capacity, n - 1);
        }

        else {
            const includeItem = knapsackRecursive(weights, values, capacity - weights[n - 1], n - 1);
            const excludeItem = knapsackRecursive(weights, values, capacity, n - 1);

            const valueIncludingItem = values[n - 1] + includeItem.value;
            const valueExcludingItem = excludeItem.value;

            if (valueIncludingItem > valueExcludingItem) {
                const itemsIncluding = [...includeItem.items, n - 1];
                return { value: valueIncludingItem, weight: weights[n - 1] + includeItem.weight, items: itemsIncluding };
            } else {
                return excludeItem;
            }
        }
    };

    const calculateKnapsack = () => {
        const itemsCopy = [...items]; 
        const start = performance.now();
        const result = knapsackRecursive(
            itemsCopy.map(item => item.weight),
            itemsCopy.map(item => item.value),
            parseInt(capacity),
            itemsCopy.length
        );
        const end = performance.now();
        setExecutionTime(end - start);
        setKnapsackResult(result);
    };

    const percentageFilled = () => {
        if (!knapsackResult) return 0; 
        const totalWeight = knapsackResult.weight;
        return (totalWeight / parseInt(capacity)) * 100;
    };

    return (
        <div className="container">
            <h2>Knapsack</h2>
            <div>
                <label htmlFor="capacity">Capacidad del contenedor:</label>
                <input type="number" id="capacity" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Ingrese Capacidad" />
            </div>
            <div>
                <label htmlFor="itemWeight">Peso:</label>
                <input type="number" id="itemWeight" value={itemWeight} onChange={e => setItemWeight(e.target.value)} placeholder="Ingrese el peso" />
            </div>
            <div>
                <label htmlFor="itemValue">Valor:</label>
                <input type="number" id="itemValue" value={itemValue} onChange={e => setItemValue(e.target.value)} placeholder="Ingrese el valor" />
            </div>            
            <button onClick={addItem}>Agregar objeto</button>
            <button onClick={calculateKnapsack}>Ejecutar Algoritmo</button>
            <div className="item-list">
                {items.map((item, index) => (
                    <div key={index} className="item">
                        <span>{`Peso: ${item.weight}, Valor: ${item.value}`}</span>
                        <button onClick={() => deleteItem(index)}>Delete</button>
                    </div>
                ))}
            </div>
            <div className="knapsack-container">
                <div className="knapsack-fill" style={{ width: `${percentageFilled()}%` }}></div>
            </div>
            <div id="result">
                Máximo valor: {knapsackResult ? knapsackResult.value : 'N/A'}<br />
                Objetos en el contenedor:
                {knapsackResult && knapsackResult.items.map((item, index) => (
                    <div key={index}>
                        {items[item] && `Peso: ${items[item].weight}, Valor: ${items[item].value}`}
                    </div>
                ))}
            </div>
            <div>Tiempo de Ejecución: {executionTime} ms</div>
        </div>
    );
}

export default Knapsack;