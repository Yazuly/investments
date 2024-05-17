import React from "react";
import "./App.css";

const CalculatorButton = ({ onClick, label, className }) => {
  return (
    <button className={`calculator-button ${className}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default CalculatorButton;
