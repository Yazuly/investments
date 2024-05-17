import React, { useState } from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location
import CalculatorButton from "./CalculatorButton";
import InvestmentForcaster from "./InvestmentForcaster";
import InvestmentStrategy from "./InvestmentStrategy";
import InvestmentSummary from "./InvestmentSummary";
import { Constants } from "./contants";

const InvestmentSimulator = (props) => {
  const [strategies, setStrategies] = useState([
    createStrategy(Constants.DEFAULT_STRATEGY_INPUTS),
  ]);
  const [error, setError] = useState(undefined);
  const [results, setResults] = useState(undefined);
  const [showSummary, setShowSummary] = useState(true);

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

  const toggleSummary = () => setShowSummary(!showSummary);

  const onResults = (results) => {
    setResults(results);
  };

  const onError = (error) => {
    setError(error);
  };

  return (
    <div>
      <CalculatorButton onClick={addStrategy} label="Add Strategy" />;<br></br>
      <br></br>
      <div className="strategies-container">
        {strategies.map((strategy, index) => (
          <div key={index} className="strategy-wrapper">
            <InvestmentStrategy
              strategy={strategy}
              updateStrategy={(updatedStrategy) =>
                updateStrategy(updatedStrategy)
              }
              removeStrategy={() => removeStrategy(strategy.id)}
            />
          </div>
        ))}
      </div>
      <InvestmentForcaster
        onResults={onResults}
        onError={onError}
        strategies={strategies}
      />
      {error && (
        <div className="error-message">
          <p className="error-text">
            <i className="fas fa-exclamation-circle"></i> Error: {error}
          </p>
        </div>
      )}
      {results && (
        <>
          {/* <br></br>
          <CalculatorButton
            onClick={toggleSummary}
            label={showSummary ? "Hide Summary" : "Show Summary"}
          /> */}

          {results && showSummary && strategies?.length > 0 && (
            <InvestmentSummary results={results}></InvestmentSummary>
          )}
        </>
      )}
    </div>
  );
};

const createStrategy = (inputs) => {
  return { id: crypto.randomUUID(), ...inputs };
};

export default InvestmentSimulator;
