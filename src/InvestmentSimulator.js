import React, { useEffect, useState } from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location

const InvestmentSimulator = () => {
  const [inputs, setInputs] = useState({
    initialMoney: 250000,
    apartmentPrice: 500000,
    netRentIncome: 3000,
    loanAmount: 250000,
    loanInterestRate: 6,
    loanTimeYears: 15,
    investmentTimeYears: 15,
    monthlyContribution: 10000,
    priceGrowthRate: 3.5,
    rentIncomeYearlyIncrease: 100,
  });

  const [results, setResults] = useState({
    totalApartments: 0,
    totalValue: 0,
    totalMonthlyPassiveIncome: 0,
    totalMonthlyPassiveIncomeAfterCoveringLoans: 0,
    totalLoansLeft: 0,
    apartments: [],
    monthlyDetails: [],
    totalApartmentsAfterSellingApartmentsForCoveringLoans: 0,
    moneyLeftWithCoveringLoans: 0,
    sellApartmentWhenLoanIsOver: false,
  });

  const maxLoanToApartmentPriceRatio = 0.9;

  const handleInitialMoneyChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      initialMoney: parseFloat(event.target.value),
    }));
  };

  const handleApartmentPriceChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      apartmentPrice: parseFloat(event.target.value),
    }));
  };

  const handleNetRentIncomeChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      netRentIncome: parseFloat(event.target.value),
    }));
  };

  const hanldeRentIncomeYearlyIncrease = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      rentIncomeYearlyIncrease: parseFloat(event.target.value),
    }));
  };

  const handleLoanAmountChange = (event) => {
    const value = Math.min(
      parseFloat(event.target.value),
      inputs.apartmentPrice * maxLoanToApartmentPriceRatio
    );
    setInputs((inputs) => ({ ...inputs, loanAmount: value }));
  };

  const handleLoanInterestRateChange = (event) => {
    const value = Math.max(parseFloat(event.target.value), 1);
    setInputs((inputs) => ({ ...inputs, loanInterestRate: value }));
  };

  const handleLoanTimeYearsChange = (event) => {
    const value = Math.max(parseFloat(event.target.value), 1);
    setInputs((inputs) => ({ ...inputs, loanTimeYears: value }));
  };

  const handleInvestmentTimeYearsChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      investmentTimeYears: parseFloat(event.target.value),
    }));
  };

  const handleMonthlyContributionChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      monthlyContribution: parseFloat(event.target.value),
    }));
  };

  const handlePriceGrowthRateChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      priceGrowthRate: parseFloat(event.target.value),
    }));
  };

  const sellApartmentWhenLoanIsOverChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      sellApartmentWhenLoanIsOver: !inputs.sellApartmentWhenLoanIsOver,
    }));
  };

  useEffect(() => {
    simulateInvestment();
  }, [inputs]); // Dependency array includes `inputs`, so the effect runs any time `inputs` changes

  const isLoanOver = (currentMonth, apartment) =>
    currentMonth > apartment.loanEndTime;

  const calculateLoanPaymentsDetails = (
    loanAmount,
    loanInterestRate,
    years
  ) => {
    const monthlyRate = loanInterestRate / 12 / 100;
    const numberOfPayments = years * 12;
    const monthlyLoanPayment =
      (loanAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
    return { monthlyLoanPayment, monthlyRate, numberOfPayments };
  };

  const calculateLoanPayments = (
    loanAmount,
    monthlyLoanPayment,
    monthlyRate,
    numberOfPayments
  ) => {
    if (monthlyLoanPayment === 0) {
      return undefined;
    }

    const payments = [];
    let remainingPrincipal = loanAmount;
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = monthlyLoanPayment - interestPayment;
      remainingPrincipal -= principalPayment;

      payments.push({
        remainingPrincipal,
        principal: principalPayment,
        interest: interestPayment,
      });
    }

    return payments;
  };

  const calculateRentIncome = (month, apartment) => {
    return (
      inputs.netRentIncome +
      Math.floor((month - apartment.boughtMonth) / 12) *
        inputs.rentIncomeYearlyIncrease
    );
  };

  const updateApartmentMonthlyIncome = (month, apartments) => {
    apartments.forEach((apartment) => {
      let loanReturn =
        month >= apartment.loanEndTime ? 0 : apartment.monthlyLoanPayment;
      let rentIncome = calculateRentIncome(month, apartment);
      apartment.netRentIncome = rentIncome - loanReturn;
    });
  };

  const simulateInvestment = () => {
    let {
      initialMoney,
      apartmentPrice,
      netRentIncome,
      loanAmount,
      loanInterestRate,
      loanTimeYears,
      investmentTimeYears,
      monthlyContribution,
      priceGrowthRate,
    } = inputs;

    const totalMonths = investmentTimeYears * 12;
    let month = 1;
    let money = initialMoney;
    let apartments = [];
    let monthlyDetails = [
      {
        month: 0,
        money,
        totalIncome: 0,
        incomeFromRent: 0,
        numOfApartments: 0,
        numOfSoldApartments: 0,
        totalMoneyFromSoldApartments: 0,
      },
    ];

    while (month <= totalMonths) {
      while (money + loanAmount >= apartmentPrice) {
        let yearsHeld = (totalMonths + 1 - month) / 12;
        if (inputs.sellApartmentWhenLoanIsOver) {
          yearsHeld = Math.min(loanTimeYears, yearsHeld);
        }

        let priceAfterGrowth =
          apartmentPrice * Math.pow(1 + priceGrowthRate / 100, yearsHeld);

        const { monthlyLoanPayment, monthlyRate, numberOfPayments } =
          calculateLoanPaymentsDetails(
            loanAmount,
            loanInterestRate,
            loanTimeYears
          );

        let loanEndTime = month - 1 + loanTimeYears * 12;
        const payments = calculateLoanPayments(
          loanAmount,
          monthlyLoanPayment,
          monthlyRate,
          numberOfPayments
        );
        const remainingPrincipal =
          !!payments && loanEndTime > totalMonths
            ? payments[totalMonths - month].remainingPrincipal
            : 0;

        let newApartment = {
          boughtMonth: month,
          loanEndTime: loanEndTime,
          remainingPrincipal,
          payments,
          price: apartmentPrice,
          priceAfterGrowth: priceAfterGrowth,
          monthlyLoanPayment,
          netRentIncome: netRentIncome - monthlyLoanPayment,
        };

        apartments.push(newApartment);

        money -= apartmentPrice - loanAmount;
      }

      let numOfSoldApartments = 0;
      let totalMoneyFromSoldApartments = 0;
      if (inputs.sellApartmentWhenLoanIsOver) {
        apartments.forEach((apartment) => {
          if (isLoanOver(month, apartment)) {
            numOfSoldApartments++;
            totalMoneyFromSoldApartments += apartment.priceAfterGrowth;
          }
        });
        apartments = apartments.filter(
          (apartment) => !isLoanOver(month, apartment)
        );
      }

      money += totalMoneyFromSoldApartments;

      updateApartmentMonthlyIncome(month, apartments);
      let incomeFromRent = apartments.reduce(
        (sum, apt) => sum + apt.netRentIncome,
        0
      );

      let totalIncome = monthlyContribution + incomeFromRent;
      money += totalIncome;

      monthlyDetails.push({
        month,
        money,
        totalIncome,
        incomeFromRent,
        numOfApartments: apartments.length,
        numOfSoldApartments,
        totalMoneyFromSoldApartments,
      });

      month++;
    }

    const totalValue = apartments.reduce(
      (acc, apt) => acc + apt.priceAfterGrowth,
      0
    );
    const totalMonthlyPassiveIncome = apartments
      .map((a) => a.netRentIncome)
      .reduce((a, b) => a + b, 0);
    const totalLoansPrincipleLeft = apartments.reduce(
      (acc, apt) => acc + apt.remainingPrincipal,
      0
    );

    let numOfApartmentsToSellForCoveringLoan = 0;
    let apartmentsToSellTotalPrice = 0;
    for (let i = 0; i < apartments.length; i++) {
      if (apartmentsToSellTotalPrice + money >= totalLoansPrincipleLeft) {
        break;
      }
      apartmentsToSellTotalPrice += apartments[i].priceAfterGrowth;
      numOfApartmentsToSellForCoveringLoan++;
    }
    const totalApartmentsAfterSellingApartmentsForCoveringLoans =
      apartments.length - numOfApartmentsToSellForCoveringLoan;
    const moneyLeftWithCoveringLoans =
      apartmentsToSellTotalPrice + money - totalLoansPrincipleLeft;

    const totalMonthlyPassiveIncomeAfterCoveringLoans = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .map((apartment) => calculateRentIncome(totalMonths, apartment))
      .reduce((a, b) => a + b, 0);

    setResults({
      totalApartments: apartments.length,
      totalValue,
      totalMonthlyPassiveIncome,
      totalMonthlyPassiveIncomeAfterCoveringLoans,
      totalLoansPrincipleLeft,
      apartments,
      money: money,
      monthlyDetails: monthlyDetails,
      totalApartmentsAfterSellingApartmentsForCoveringLoans,
      moneyLeftWithCoveringLoans,
    });
  };

  return (
    <div>
      <h1>Real Estate Investment Simulator</h1>

      <div class="input-table">
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
            </tr>
          </thead>
          <tr>
            <td>
              <label for="initialMoney">Initial Money</label>
            </td>
            <td>
              <input
                type="number"
                id="initialMoney"
                name="initialMoney"
                value={inputs.initialMoney}
                onChange={handleInitialMoneyChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="apartmentPrice">Apartment Price</label>
            </td>
            <td>
              <input
                type="number"
                id="apartmentPrice"
                name="apartmentPrice"
                value={inputs.apartmentPrice}
                onChange={handleApartmentPriceChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="netRentIncome">Net Rent Income</label>
            </td>
            <td>
              <input
                type="number"
                id="netRentIncome"
                name="netRentIncome"
                value={inputs.netRentIncome}
                onChange={handleNetRentIncomeChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="rentIncomeYearlyIncrease">
                Rent Income Yearly Increase
              </label>
            </td>
            <td>
              <input
                type="number"
                id="rentIncomeYearlyIncrease"
                name="rentIncomeYearlyIncrease"
                value={inputs.rentIncomeYearlyIncrease}
                onChange={hanldeRentIncomeYearlyIncrease}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="loanAmount">Loan Amount</label>
            </td>
            <td>
              <input
                type="number"
                id="loanAmount"
                name="loanAmount"
                value={inputs.loanAmount}
                onChange={handleLoanAmountChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="loanInterestRate">Loan Interest Rate</label>
            </td>
            <td>
              <input
                type="number"
                id="loanInterestRate"
                name="loanInterestRate"
                value={inputs.loanInterestRate}
                onChange={handleLoanInterestRateChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="loanTimeYears">Loan Time Years</label>
            </td>
            <td>
              <input
                type="number"
                id="loanTimeYears"
                name="loanTimeYears"
                value={inputs.loanTimeYears}
                onChange={handleLoanTimeYearsChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="investmentTimeYears">Investment Time Years</label>
            </td>
            <td>
              <input
                type="number"
                id="investmentTimeYears"
                name="investmentTimeYears"
                value={inputs.investmentTimeYears}
                onChange={handleInvestmentTimeYearsChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="monthlyContribution">Monthly Contribution</label>
            </td>
            <td>
              <input
                type="number"
                id="monthlyContribution"
                name="monthlyContribution"
                value={inputs.monthlyContribution}
                onChange={handleMonthlyContributionChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="priceGrowthRate">Price Growth Rate</label>
            </td>
            <td>
              <input
                type="number"
                id="priceGrowthRate"
                name="priceGrowthRate"
                value={inputs.priceGrowthRate}
                onChange={handlePriceGrowthRateChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="sellApartmentWhenLoanIsOver">
                Sell Apartment When Loan Is Over
              </label>
            </td>
            <td>
              <input
                className="checkbox"
                type="checkbox"
                id="sellApartmentWhenLoanIsOver"
                name="sellApartmentWhenLoanIsOver"
                checked={inputs.sellApartmentWhenLoanIsOver}
                onChange={sellApartmentWhenLoanIsOverChange}
              />
            </td>
          </tr>
        </table>
      </div>
      <h2>Investment Summary</h2>
      <div className="flex-table results-table">
        <div className="flex-row header">
          <div className="cell">Subject</div>
          <div className="cell">Value</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Apartments:</div>
          <div className="cell">{results.totalApartments}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Value:</div>
          <div className="cell">{results.totalValue.toLocaleString()}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Monthly Passive Income:</div>
          <div className="cell">
            {results.totalMonthlyPassiveIncome.toLocaleString()}
          </div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Loans Principle Left to Pay:</div>
          <div className="cell">
            {results.totalLoansPrincipleLeft?.toLocaleString()}
          </div>
        </div>
        <div className="flex-row">
          <div className="cell">TotalValue - LoansPrincipleLeftToPay:</div>
          <div className="cell">
            {(
              results.totalValue - results.totalLoansPrincipleLeft
            )?.toLocaleString()}
          </div>
        </div>
        <div className="flex-row">
          <div className="cell">Money:</div>
          <div className="cell">{results?.money?.toLocaleString() || 0}</div>
        </div>
        <div className="flex-row">
          <div className="cell">
            Total Apartments After Selling Apartments For Covering Loans:
          </div>
          <div className="cell">
            {results?.totalApartmentsAfterSellingApartmentsForCoveringLoans?.toLocaleString() ||
              0}
          </div>
        </div>
        <div className="flex-row">
          <div className="cell">Money Left After Covering Loans:</div>
          <div className="cell">
            {results?.moneyLeftWithCoveringLoans?.toLocaleString() || 0}
          </div>
        </div>
        <div className="flex-row">
          <div className="cell">
            Total Monthly Passive Income After Covering Loans:
          </div>
          <div className="cell">
            {results.totalMonthlyPassiveIncomeAfterCoveringLoans.toLocaleString()}
          </div>
        </div>
      </div>
      <h2>Monthly Details</h2>
      <div className="flex-table apartments-table">
        <div className="flex-row header">
          <div className="cell">Apartment Index</div>
          <div className="cell">Loan Start Month</div>
          <div className="cell">Loan End Month</div>
          <div className="cell">Remaining Loan Principle</div>
          <div className="cell">Net Rent Income On The End</div>
          <div className="cell">Price After Growth</div>{" "}
          {/* New column for grown price */}
        </div>
        {results.apartments.map((apt, index) => (
          <div key={index} className="flex-row">
            <div className="cell">{index + 1}</div>
            <div className="cell">{apt.boughtMonth}</div>
            <div className="cell">{apt.loanEndTime}</div>
            <div className="cell">
              {apt.remainingPrincipal.toLocaleString()}
            </div>
            <div className="cell">{apt.netRentIncome.toLocaleString()}</div>
            <div className="cell">
              {apt.priceAfterGrowth.toLocaleString()}
            </div>{" "}
            {/* Display grown price */}
          </div>
        ))}
      </div>
      <h2>Monthly Details</h2>
      <div className="flex-table monthly-details-table">
        <div className="flex-row header">
          <div className="cell">month</div>
          <div className="cell">money</div>
          <div className="cell">totalIncome</div>
          <div className="cell">incomeFromRent</div>
          <div className="cell">numOfApartments</div>
          <div className="cell">numOfSoldApartments</div>
          <div className="cell">totalMoneyFromSoldApartments</div>
        </div>
        {results?.monthlyDetails?.map((apt, index) => (
          <div key={index} className="flex-row">
            <div className="cell">{apt.month}</div>
            <div className="cell">{apt.money.toLocaleString()}</div>
            <div className="cell">{apt.totalIncome.toLocaleString()}</div>
            <div className="cell">{apt.incomeFromRent.toLocaleString()}</div>
            <div className="cell">{apt.numOfApartments}</div>
            <div className="cell">
              {apt.numOfSoldApartments.toLocaleString()}
            </div>
            <div className="cell">{apt.totalMoneyFromSoldApartments}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentSimulator;
