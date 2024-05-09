import React from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location
import InvestmentForcaster from "./InvestmentForcaster";

const InvestmentSimulator = (props) => {
  return (
    <>
      <h1>Real Estate Investment Simulator</h1>
      <InvestmentForcaster></InvestmentForcaster>
    </>
  );
};

export default InvestmentSimulator;
