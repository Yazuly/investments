import React, { useEffect, useState } from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location
import InvestmentInputs from "./InvestmentsInputs";
import InvestmentSummary from "./InvestmentSummary";
import {
  getLoanMonthlyPayment,
  getRentIncomeAfterTaxes,
} from "./InvestmentUtils";

//TODO::SEPARATE RENT INCOME AND LOAN, because taxes are on the rentincome-loan and it is not right, just on rent income it shuold be

const InvestmentForcaster = () => {
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

  const maxApartments = 300;

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

  const getApartmentPriceAfterTaxes = (apartment) => {
    return (
      apartment.price +
      (apartment.priceAfterGrowth - apartment.price) *
        (1 - inputs.capitalGainsTaxPercent / 100)
    );
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

      const incomeFromRentAfterTaxes = getRentIncomeAfterTaxes(
        incomeFromRent,
        inputs.yearlyRentTaxesInPercent
      );

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
      getRentIncomeAfterTaxes(
        totalRentIncome,
        inputs.yearlyRentTaxesInPercent
      ) - totalMonthlyLoansPayments;

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
      getRentIncomeAfterTaxes(
        totalMonthlyPassiveIncomeAfterCoveringLoans,
        inputs.yearlyRentTaxesInPercent
      );

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
      <InvestmentInputs
        inputs={inputs}
        setInputs={setInputs}
      ></InvestmentInputs>

      <div className="error-message">
        {error && <p className="error-text">Error: {error}</p>}
        {!error && <p className="valid-text">Valid Inputs</p>}
      </div>
      {!error && (
        <InvestmentSummary
          results={results}
          inputs={inputs}
        ></InvestmentSummary>
      )}
    </div>
  );
};

export default InvestmentForcaster;
