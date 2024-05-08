import React, { useEffect, useState } from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location

//TODO::SEPARATE RENT INCOME AND LOAN, because taxes are on the rentincome-loan and it is not right, just on rent income it shuold be

const InvestmentSimulator = () => {
  const [inputs, setInputs] = useState({
    initialMoney: 200000,
    apartmentPrice: 400000,
    netYearlyRentIncomeInPercent: 5,
    yearlyRentTaxesInPercent: 10,
    loanAmountInPercent: 50,
    loanInterestRate: 6,
    loanTimeYears: 15,
    investmentTimeYears: 15,
    monthlyContribution: 10000,
    priceGrowthRate: 5,
    capitalGainsTaxPercent: 25,
  });

  const [results, setResults] = useState({
    totalApartments: 0,
    totalValue: 0,
    totalValueAfterTaxes: 0,
    totalValueAfterCoveringLoans: 0,
    totalValueAfterCoveringLoansAfterTaxes: 0,
    totalMonthlyPassiveIncome: 0,
    totalMonthlyPassiveIncomeAfterTaxes: 0,
    totalMonthlyPassiveIncomeAfterCoveringLoans: 0,
    totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes: 0,
    totalLoansLeft: 0,
    apartments: [],
    monthlyDetails: [],
    totalApartmentsAfterSellingApartmentsForCoveringLoans: 0,
    moneyLeftWithCoveringLoans: 0,
    sellApartmentWhenLoanIsOver: false,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      setError(errorMessage);
    } else {
      setError("");
      simulateInvestment();
    }
  }, [inputs]); // Dependency array includes `inputs`

  useEffect(() => {
    setError(validateOutputs());
  }, [results]); // Dependency array includes `inputs`

  const validateInputs = () => {
    const nullInputsKeys = Object.keys(inputs).filter((key) =>
      isNaN(inputs[key])
    );
    if (nullInputsKeys.length > 0) {
      return (
        "the following inputs were not provided: " + nullInputsKeys.join(" , ")
      );
    }
    return ""; // No errors
  };

  const validateOutputs = () => {
    let monthsWithNegativeMoney =
      results?.monthlyDetails?.filter((details) => details.money < 0) || [];
    if (monthsWithNegativeMoney.length > 0) {
      return "Loan returns are leading to negative money.";
    }
    return;
  };

  const getRentIncomeAfterTaxes = (income) => {
    return income * (1 - inputs.yearlyRentTaxesInPercent / 100);
  };

  const getApartmentPriceAfterTaxes = (apartment) => {
    return (
      apartment.price +
      (apartment.priceAfterGrowth - apartment.price) *
        (1 - inputs.capitalGainsTaxPercent / 100)
    );
  };

  const maxLoanAmountInPercent = 90;
  const maxApartments = 300;

  const handleInitialMoneyChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      initialMoney: parseFloat(event.target.value),
    }));
  };

  const handleApartmentPriceChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      apartmentPrice: Math.max(parseFloat(event.target.value)),
    }));
  };

  const handleNetYearlyRentIncomeInPercentChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      netYearlyRentIncomeInPercent: parseFloat(event.target.value),
    }));
  };

  const handleYearlyRentTaxesInPercentChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      yearlyRentTaxesInPercent: parseFloat(event.target.value),
    }));
  };

  const handleLoanAmountInPercentChange = (event) => {
    const value = Math.min(
      parseFloat(event.target.value),
      maxLoanAmountInPercent
    );
    setInputs((inputs) => ({ ...inputs, loanAmountInPercent: value }));
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

  const handleCapitalGainsTaxPercentChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      capitalGainsTaxPercent: parseFloat(event.target.value),
    }));
  };

  const sellApartmentWhenLoanIsOverChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      sellApartmentWhenLoanIsOver: !inputs.sellApartmentWhenLoanIsOver,
    }));
  };

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

  const calculateRentIncome = (month, boughtMonth) => {
    const yearsHeld = Math.floor((month - boughtMonth) / 12);
    return (
      (getApartmentPrceAfterGrowth(yearsHeld) *
        (inputs.netYearlyRentIncomeInPercent / 100)) /
      12
    );
  };

  const updateApartmentMonthlyIncome = (month, apartments) => {
    apartments.forEach((apartment) => {
      apartment.netRentIncome = calculateRentIncome(
        month,
        apartment.boughtMonth
      );
    });
  };

  const getLoanMonthlyPayment = (apartment, month) =>
    month > apartment.loanEndTime ? 0 : apartment.monthlyLoanPayment;

  const getApartmentPrceAfterGrowth = (yearsHeld) =>
    inputs.apartmentPrice *
    Math.pow(1 + inputs.priceGrowthRate / 100, yearsHeld);

  const simulateInvestment = () => {
    let {
      initialMoney,
      apartmentPrice,
      loanAmountInPercent,
      loanInterestRate,
      loanTimeYears,
      investmentTimeYears,
      monthlyContribution,
    } = inputs;

    const totalMonths = investmentTimeYears * 12;
    let month = 1;
    let money = initialMoney;
    let loanAmount = (loanAmountInPercent / 100) * apartmentPrice;
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
        totalMoneyFromSoldApartmentsAfterTaxes: 0,
        totalMonthlyPassiveIncomeAfterTaxes: 0,
        totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes: 0,
        totalMonthlyLoansPayments: 0,
        incomeFromRentAfterTaxes: 0,
      },
    ];

    while (month <= totalMonths) {
      while (money + loanAmount >= apartmentPrice) {
        let yearsHeld = (totalMonths + 1 - month) / 12;
        if (inputs.sellApartmentWhenLoanIsOver) {
          yearsHeld = Math.min(loanTimeYears, yearsHeld);
        }

        let priceAfterGrowth = getApartmentPrceAfterGrowth(yearsHeld);

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
          netRentIncome: calculateRentIncome(month, month),
        };

        apartments.push(newApartment);

        money -= apartmentPrice - loanAmount;

        if (apartments.length > maxApartments) {
          setError(`Inputs are leading to more than 1000 apartments`);
          return;
        }
      }

      let numOfSoldApartments = 0;
      let totalMoneyFromSoldApartments = 0;
      let totalMoneyFromSoldApartmentsAfterTaxes = 0;
      if (inputs.sellApartmentWhenLoanIsOver) {
        apartments.forEach((apartment) => {
          if (isLoanOver(month, apartment)) {
            numOfSoldApartments++;
            totalMoneyFromSoldApartments += apartment.priceAfterGrowth;
            totalMoneyFromSoldApartmentsAfterTaxes =
              getApartmentPriceAfterTaxes(apartment);
          }
        });
        apartments = apartments.filter(
          (apartment) => !isLoanOver(month, apartment)
        );
      }

      money += totalMoneyFromSoldApartmentsAfterTaxes;

      updateApartmentMonthlyIncome(month, apartments);
      const incomeFromRent = apartments.reduce(
        (sum, apt) => sum + apt.netRentIncome,
        0
      );

      const totalMonthlyLoansPayments = apartments.reduce(
        (sum, apartment) => sum + getLoanMonthlyPayment(apartment, month),
        0
      );

      const incomeFromRentAfterTaxes = getRentIncomeAfterTaxes(incomeFromRent);

      let totalIncome =
        monthlyContribution +
        incomeFromRentAfterTaxes -
        totalMonthlyLoansPayments;

      money += totalIncome;

      monthlyDetails.push({
        month,
        money,
        totalIncome,
        incomeFromRent,
        incomeFromRentAfterTaxes,
        totalMonthlyLoansPayments,
        numOfApartments: apartments.length,
        numOfSoldApartments,
        totalMoneyFromSoldApartments,
        totalMoneyFromSoldApartmentsAfterTaxes,
      });

      month++;
    }
    updateApartmentMonthlyIncome(month, apartments);

    const totalValue = apartments.reduce(
      (acc, apt) => acc + apt.priceAfterGrowth,
      0
    );
    const totalValueAfterTaxes = apartments.reduce(
      (acc, apt) => acc + getApartmentPriceAfterTaxes(apt),
      0
    );

    const totalMonthlyLoansPayments = apartments.reduce(
      (sum, apartment) => sum + getLoanMonthlyPayment(apartment, month),
      0
    );

    const totalRentIncome = apartments
      .map((a) => a.netRentIncome)
      .reduce((a, b) => a + b, 0);
    const totalLoansPrincipleLeft = apartments.reduce(
      (acc, apt) => acc + apt.remainingPrincipal,
      0
    );

    const totalMonthlyPassiveIncome =
      totalRentIncome - totalMonthlyLoansPayments;

    const totalMonthlyPassiveIncomeAfterTaxes =
      getRentIncomeAfterTaxes(totalRentIncome) - totalMonthlyLoansPayments;

    let numOfApartmentsToSellForCoveringLoan = 0;
    let apartmentsToSellTotalPrice = 0;
    let apartmentsToSellTotalPriceAfterTaxes = 0;
    for (let i = 0; i < apartments.length; i++) {
      if (
        apartmentsToSellTotalPriceAfterTaxes + money >=
        totalLoansPrincipleLeft
      ) {
        break;
      }
      apartmentsToSellTotalPrice += apartments[i].priceAfterGrowth;
      apartmentsToSellTotalPriceAfterTaxes += getApartmentPriceAfterTaxes(
        apartments[i]
      );
      numOfApartmentsToSellForCoveringLoan++;
    }
    const totalApartmentsAfterSellingApartmentsForCoveringLoans =
      apartments.length - numOfApartmentsToSellForCoveringLoan;
    const moneyLeftWithCoveringLoans =
      apartmentsToSellTotalPriceAfterTaxes + money - totalLoansPrincipleLeft;

    debugger;
    const totalMonthlyPassiveIncomeAfterCoveringLoans = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .map((apartment) =>
        calculateRentIncome(totalMonths + 1, apartment.boughtMonth)
      )
      .reduce((a, b) => a + b, 0);
    const totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes =
      getRentIncomeAfterTaxes(totalMonthlyPassiveIncomeAfterCoveringLoans);

    const totalValueAfterCoveringLoans = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .reduce((acc, apt) => acc + apt.priceAfterGrowth, 0);

    const totalValueAfterCoveringLoansAfterTaxes = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .reduce((acc, apt) => acc + getApartmentPriceAfterTaxes(apt), 0);

    setResults({
      totalApartments: apartments.length,
      totalValue,
      totalMonthlyPassiveIncome,
      totalMonthlyPassiveIncomeAfterTaxes,
      totalValueAfterTaxes,
      totalValueAfterCoveringLoans,
      totalValueAfterCoveringLoansAfterTaxes,
      totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes,
      apartmentsToSellTotalPrice,
      apartmentsToSellTotalPriceAfterTaxes,
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
              <label for="initialCapital">Initial capital</label>
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
              <label for="apartmentPrice">Price of the apartment</label>
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
              <label for="netYearlyRentIncomeInPercent">
                Net yearly rent income in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="netYearlyRentIncomeInPercent"
                name="netYearlyRentIncomeInPercent"
                value={inputs.netYearlyRentIncomeInPercent}
                onChange={handleNetYearlyRentIncomeInPercentChange}
              />
            </td>
          </tr>

          <tr>
            <td>
              <label for="yearlyRentTaxesInPercent">
                Yearly rental taxes in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="yearlyRentTaxesInPercent"
                name="yearlyRentTaxesInPercent"
                value={inputs.yearlyRentTaxesInPercent}
                onChange={handleYearlyRentTaxesInPercentChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="loanAmountInPercent">Loan amount in percent</label>
            </td>
            <td>
              <input
                type="number"
                id="loanAmountInPercent"
                name="loanAmountInPercent"
                value={inputs.loanAmountInPercent}
                onChange={handleLoanAmountInPercentChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="loanInterestRate">
                Loan interest rate in percent
              </label>
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
              <label for="loanTimeYears">Investment duration in years</label>
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
              <label for="investmentTimeYears">
                Investment duration in years
              </label>
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
              <label for="monthlyContribution">
                Monthly contribution to investment
              </label>
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
              <label for="priceGrowthRate">
                Annual growth rate of property prices
              </label>
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
              <label for="capitalGainsTaxPercent">
                Capital gains tax rate in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="capitalGainsTaxPercent"
                name="capitalGainsTaxPercent"
                value={inputs.capitalGainsTaxPercent}
                onChange={handleCapitalGainsTaxPercentChange}
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
      <div className="error-message">
        {error && <p className="error-text">Error: {error}</p>}
        {!error && <p className="valid-text">Valid Inputs</p>}
      </div>
      {!error && (
        <>
          <h2>Summary</h2>
          <div className="flex-table results-table">
            <div className="flex-row header">
              <div className="cell">Subject</div>
              <div className="cell">Value</div>
            </div>
          </div>
          <div className="flex-row">
            <div className="cell">Total Apartments:</div>
            <div className="cell">
              {results?.totalApartments?.toLocaleString() || 0}
            </div>
          </div>
          <div className="flex-row">
            <div className="cell">Total Apartments Value:</div>
            <div className="cell">{results.totalValue?.toLocaleString()}</div>
          </div>
          <div className="flex-row">
            <div className="cell">Total Apartments Value After Taxes:</div>
            <div className="cell">
              {results.totalValueAfterTaxes?.toLocaleString()}
            </div>
          </div>

          <div className="flex-row">
            <div className="cell">Total Loans Principle Left to Pay:</div>
            <div className="cell">
              {results.totalLoansPrincipleLeft?.toLocaleString()}
            </div>
          </div>
          <div className="flex-row">
            <div className="cell">Liquid Cash:</div>
            <div className="cell">{results?.money?.toLocaleString() || 0}</div>
          </div>
          <div className="flex-row">
            <div className="cell">Total Monthly Passive Income:</div>
            <div className="cell">
              {results.totalMonthlyPassiveIncome.toLocaleString()}
            </div>
          </div>
          <div className="flex-row">
            <div className="cell">
              Total Monthly Passive Income After Taxes:
            </div>
            <div className="cell">
              {results.totalMonthlyPassiveIncomeAfterTaxes.toLocaleString()}
            </div>
          </div>

          <h2>Summary With Covering Loans</h2>
          <div className="flex-table results-table">
            <div className="flex-row header">
              <div className="cell">Subject</div>
              <div className="cell">Value</div>
            </div>
            <div className="flex-row">
              <div className="cell">Total Apartments:</div>
              <div className="cell">
                {results?.totalApartmentsAfterSellingApartmentsForCoveringLoans?.toLocaleString() ||
                  0}
              </div>
            </div>
            <div className="flex-row">
              <div className="cell">Total Apartments Value:</div>
              <div className="cell">
                {results?.totalValueAfterCoveringLoans?.toLocaleString() || 0}
              </div>
            </div>
            <div className="flex-row">
              <div className="cell">Total Apartments Value After Taxes:</div>
              <div className="cell">
                {results?.totalValueAfterCoveringLoansAfterTaxes?.toLocaleString() ||
                  0}
              </div>
            </div>
            <div className="flex-row">
              <div className="cell">Sold Apartments Price:</div>
              <div className="cell">
                {results?.apartmentsToSellTotalPrice?.toLocaleString() || 0}
              </div>
            </div>

            <div className="flex-row">
              <div className="cell">Sold Apartments Price After Taxes:</div>
              <div className="cell">
                {results?.apartmentsToSellTotalPriceAfterTaxes?.toLocaleString() ||
                  0}
              </div>
            </div>
            <div className="flex-row">
              <div className="cell">Liquid Cash:</div>
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
            <div className="flex-row">
              <div className="cell">
                Total Monthly Passive Income After Taxes:
              </div>
              <div className="cell">
                {results.totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes.toLocaleString()}
              </div>
            </div>
          </div>

          <h2>Apartments Details</h2>
          <div className="flex-table apartments-table">
            <div className="flex-row header">
              <div className="cell">Apartment Index</div>
              <div className="cell">Loan Start Month</div>
              <div className="cell">Loan End Month</div>
              <div className="cell">Remaining Loan Principle</div>
              <div className="cell">Loan Monthly Payment</div>
              <div className="cell">Net Rent Income</div>
              <div className="cell">Net Rent Income After Taxes</div>
              <div className="cell">Price After Growth</div>{" "}
            </div>
            {results.apartments.map((apt, index) => (
              <div key={index} className="flex-row">
                <div className="cell">{index + 1}</div>
                <div className="cell">{apt.boughtMonth}</div>
                <div className="cell">{apt.loanEndTime}</div>
                <div className="cell">
                  {apt.remainingPrincipal.toLocaleString()}
                </div>
                <div className="cell">
                  {getLoanMonthlyPayment(
                    apt,
                    inputs.investmentTimeYears * 12 + 1
                  ).toLocaleString()}
                </div>
                <div className="cell">{apt.netRentIncome.toLocaleString()}</div>
                <div className="cell">
                  {getRentIncomeAfterTaxes(apt.netRentIncome).toLocaleString()}
                </div>
                <div className="cell">
                  {apt.priceAfterGrowth.toLocaleString()}
                </div>{" "}
              </div>
            ))}
          </div>
          <h2>Monthly Details</h2>
          <div className="flex-table monthly-details-table">
            <div className="flex-row header">
              <div className="cell">month</div>
              <div className="cell">money</div>
              <div className="cell">totalIncome</div>
              <div className="cell">incomeFromRentAfterTaxes</div>
              <div className="cell">incomeFromRent</div>
              <div className="cell">totalMonthlyLoansPayments</div>
              <div className="cell">numOfApartments</div>
              <div className="cell">numOfSoldApartments</div>
              <div className="cell">totalMoneyFromSoldApartmentsAfterTaxes</div>
              <div className="cell">totalMoneyFromSoldApartments</div>
            </div>
            {results?.monthlyDetails?.map((details, index) => (
              <div key={index} className="flex-row">
                <div className="cell">{details.month}</div>
                <div className="cell">{details.money.toLocaleString()}</div>
                <div className="cell">
                  {details.totalIncome.toLocaleString()}
                </div>
                <div className="cell">
                  {details.incomeFromRentAfterTaxes.toLocaleString()}
                </div>
                <div className="cell">
                  {details.incomeFromRent.toLocaleString()}
                </div>
                <div className="cell">
                  {details.totalMonthlyLoansPayments.toLocaleString()}
                </div>

                <div className="cell">{details.numOfApartments}</div>
                <div className="cell">
                  {details.numOfSoldApartments.toLocaleString()}
                </div>
                <div className="cell">
                  {details.totalMoneyFromSoldApartmentsAfterTaxes}
                </div>
                <div className="cell">
                  {details.totalMoneyFromSoldApartments}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InvestmentSimulator;
