import React, { useState } from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location
import InvestmentForcaster from "./InvestmentForcaster";
import InvestmentStrategy from "./InvestmentStrategy";
import { Constants } from "./contants";

const InvestmentSimulator = (props) => {
  const [strategies, setStrategies] = useState([
    createStrategy(Constants.DEFAULT_STRATEGY_INPUTS),
  ]);

  const addStrategy = () => {
    const newStrategy = createStrategy(Constants.DEFAULT_STRATEGY_INPUTS);
    setStrategies((strategies) => [...strategies, newStrategy]);
  };
  const removeStrategy = (id) => {
    const newStrategies = strategies.filter((strategy) => strategy.id !== id);
    setStrategies(newStrategies);
  };

  const updateStrategy = (updatedStrategy) => {
    const newStrategies = strategies.map((strategy) =>
      strategy.id === updatedStrategy.id ? { ...updatedStrategy } : strategy
    );
    setStrategies(newStrategies);
  };

  const onResults = (results) => {
    // console.log(results);
  };

  return (
    <div>
      <button onClick={addStrategy}>Add Strategy</button>
      <br></br>
      {strategies.map((strategy, index) => (
        <InvestmentStrategy
          strategy={strategy}
          updateStrategy={(strategy) => updateStrategy(strategy)}
          removeStrategy={() => removeStrategy(strategy.id)}
        ></InvestmentStrategy>
      ))}
      {
        <InvestmentForcaster
          onResults={(results) => onResults(results)}
          strategies={strategies}
        />
      }
    </div>
  );
};

const createStrategy = (inputs) => {
  return { id: crypto.randomUUID(), ...inputs };
};

export default InvestmentSimulator;
