import React, { useEffect, useState } from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location
import InvestmentSummary from "./InvestmentSummary";
import {
  getLoanMonthlyPayment,
  getRentIncomeAfterTaxes,
} from "./InvestmentUtils";

const InvestmentForcaster = (props) => {
  const onResults = props.onResults;
  const [strategies, setStrategies] = useState([]);
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

  useEffect(() => {
    setStrategies(props.strategies);
  }, [props.strategies]);

  useEffect(() => {
    const errorMessage = validateInputs();
    console.log(errorMessage);
    if (errorMessage) {
      setError(errorMessage);
    } else {
      setError("");
      simulateInvestment();
    }
  }, [strategies]); // Dependency array includes `inputs`

  const [error, setError] = useState("");

  useEffect(() => {
    onResults(results);
  }, [results]);

  useEffect(() => {
    setError(validateOutputs());
  }, [results]); // Dependency array includes `inputs`

  const [showSummary, setShowSummary] = useState(true);
  const toggleSummary = () => setShowSummary(!showSummary);

  const validateInputs = () => {
    const nullKeys = strategies.map((strategy) =>
      Object.keys(strategy).filter((key) => key != "id" && isNaN(strategy[key]))
    );
    for (let i = 0; i < nullKeys.length; i++) {
      if (nullKeys[i].length > 0) {
        return (
          "the following inputs were not provided: " + nullKeys[i].join(" , ")
        );
      }
    }
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
        (1 - apartment.strategy.capitalGainsTaxPercent / 100)
    );
  };

  const isLoanOver = (apartment, currentMonth) =>
    currentMonth > apartment.loanEndTime || apartment.strategy.loanAmount === 0;

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

  const calculateRentIncome = (apartment, month) => {
    const yearsHeld = Math.floor((month - apartment.boughtMonth) / 12);
    return (
      (getApartmentPriceAfterGrowth(yearsHeld) *
        (apartment.strategy.netYearlyRentIncomeInPercent / 100)) /
      12
    );
  };

  const updateApartmentsMonthlyIncome = (apartments, month) => {
    apartments.forEach((apartment) => {
      apartment.netRentIncome = calculateRentIncome(apartment, month);
      apartment.netRentIncomeAfterTaxes = getRentIncomeAfterTaxes(
        apartment.netRentIncome,
        apartment.strategy.yearlyRentTaxesInPercent
      );
    });
  };

  const getApartmentPriceAfterGrowth = (apartment, month) =>
    apartment.initialPrice *
    Math.pow(
      1 + apartment.strategy.priceGrowthRate / 100,
      (apartment.boughtMonth - month) / 12
    );

  const updateRemainingPrinciple = (apartment, month) => {
    if (isLoanOver(apartment, month)) {
      this.apartment.remainingPrincipal = 0;
      return;
    }

    apartment.remainingPrincipal =
      apartment.payments[month - apartment.boughtMonth].remainingPrincipal;
  };

  const updateApartmentsRemainingPrinciple = (apartments, month) => {
    apartments.forEach((apartment) => {
      updateRemainingPrinciple(apartment, month);
    });
  };

  const buyApartment = (investmentStatus) => {
    let strategy = investmentStatus.strategy;
    const { monthlyLoanPayment, monthlyRate, numberOfPayments } =
      calculateLoanPaymentsDetails(
        strategy.loanAmount,
        strategy.loanInterestRate,
        strategy.loanTimeYears
      );

    let loanEndTime = investmentStatus.month - 1 + strategy.loanTimeYears * 12;
    const payments = calculateLoanPayments(
      strategy.loanAmount,
      monthlyLoanPayment,
      monthlyRate,
      numberOfPayments
    );

    let apartment = {
      strategy: strategy,
      boughtMonth: investmentStatus.month,
      loanEndTime: loanEndTime,
      remainingPrincipal: undefined,
      payments,
      initialPrice: strategy.apartmentPrice,
      price: strategy.apartmentPrice,
      monthlyLoanPayment,
      netRentIncome: strategy.netRentIncome,
      netRentIncomeAfterTaxes: getRentIncomeAfterTaxes(
        strategy.netRentIncome,
        strategy.yearlyRentTaxesInPercent
      ),
    };
    updateRemainingPrinciple(apartment, investmentStatus.month);
    this.apartments.push(apartment);
    investmentStatus.money -= strategy.apartmentPrice - strategy.loanAmount;
  };

  const updateApartmentsPrice = (apartments, month) => {
    apartments.forEach((apartment) => {
      apartment.priceAfterGrowth = getApartmentPriceAfterGrowth(
        apartment,
        month
      );
      apartment.pricieAfterTaxes = getApartmentPriceAfterTaxes(apartment);
    });
  };

  const updateApartmentLoanReturns = (apartments, month) => {
    apartments.forEach((apartment) => {
      apartment.monthlyLoanPayment = getLoanMonthlyPayment(apartment, month);
    });
  };

  const updateApartments = (investmentStatus) => {
    updateApartmentsPrice(investmentStatus.apartments, investmentStatus.month);
    updateApartmentsMonthlyIncome(
      investmentStatus.apartments,
      investmentStatus.month
    );
    updateApartmentsRemainingPrinciple(
      investmentStatus.apartments,
      investmentStatus.month
    );
    updateApartmentLoanReturns(
      investmentStatus.apartments,
      investmentStatus.month
    );
  };

  const updateInvestmentStatus = (investmentStatus) => {
    updateApartments(investmentStatus.apartments, investmentStatus.month);
  };

  const getApartmentsToSell = (apartments, month) => {
    return apartments.filter(
      (apartment) =>
        isLoanOver(apartment, month) &&
        apartment.strategy.sellApartmentWhenLoanIsOver
    );
  };

  const simulateInvestment = () => {
    let monthlyDetails = [
      {
        month: 0,
        money: strategies?.[0]?.initialMoney || 0,
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

    let investmentStatus = {
      money: 0,
      month: 1,
      apartments: [],
      strategy: undefined,
    };

    strategies.forEach((strategy) => {
      investmentStatus.strategy = strategy;
      investmentStatus.money += strategy.initialMoney;
      let loanAmount =
        (strategy.loanAmountInPercent / 100) * strategy.apartmentPrice;
      let totalMonths = strategy.investmentTimeYears * 12;
      for (let i = 0; i < totalMonths; i++) {
        if (investmentStatus.money + loanAmount >= strategy.apartmentPrice) {
          buyApartment(investmentStatus);
          if (investmentStatus.apartments.length > maxApartments) {
            setError(`Inputs are leading to more than 1000 apartments`);
            return;
          }
        }
        updateInvestmentStatus(investmentStatus);
      }

      let numOfSoldApartments = 0;

      let apartmentsToSell = getApartmentsToSell(
        investmentStatus.apartments,
        investmentStatus.month
      );
      numOfSoldApartments = apartmentsToSell.length;
      let apartmentsToSellIds = apartmentsToSell.map(
        (apartment) => apartment.id
      );

      investmentStatus.apartments = investmentStatus.apartments.filter(
        (apartment) => !apartmentsToSellIds.includes(apartment.id)
      );

      let totalMoneyFromSoldApartments = apartmentsToSell.reduce(
        (sum, apartment) => sum + apartment.priceAfterGrowth,
        0
      );
      let totalMoneyFromSoldApartmentsAfterTaxes = apartmentsToSell.reduce(
        (sum, apartment) => sum + apartment.pricieAfterTaxes,
        0
      );

      investmentStatus.money += totalMoneyFromSoldApartmentsAfterTaxes;

      const incomeFromRent = investmentStatus.apartments.reduce(
        (sum, apt) => sum + apt.netRentIncome,
        0
      );

      const totalMonthlyLoansPayments = investmentStatus.reduce(
        (sum, apartment) => sum + apartment.monthlyLoanPayment,
        0
      );

      const incomeFromRentAfterTaxes = investmentStatus.apartments.reduce(
        (sum, apartment) => sum + apartment.netRentIncomeAfterTaxes,
        0
      );

      let totalIncome =
        investmentStatus.strategy.monthlyContribution +
        incomeFromRentAfterTaxes -
        totalMonthlyLoansPayments;

      investmentStatus.money += totalIncome;

      monthlyDetails.push({
        month: investmentStatus.month,
        money: investmentStatus.money,
        totalIncome,
        incomeFromRent,
        incomeFromRentAfterTaxes,
        totalMonthlyLoansPayments,
        numOfApartments: investmentStatus.apartments.length,
        numOfSoldApartments,
        totalMoneyFromSoldApartments,
        totalMoneyFromSoldApartmentsAfterTaxes,
      });

      investmentStatus.month++;
    });

    let apartments = investmentStatus.apartments;

    updateApartments(investmentStatus);

    const totalValue = apartments.reduce(
      (sum, apartment) => sum + apartment.priceAfterGrowth,
      0
    );
    const totalValueAfterTaxes = apartments.reduce(
      (sum, apartment) => sum + apartment.pricieAfterTaxes,
      0
    );

    const totalMonthlyLoansPayments = apartments.reduce(
      (sum, apartment) => sum + apartment.monthlyLoanPayment,
      0
    );

    const totalRentIncome = apartments.reduce(
      (sum, apartment) => sum + apartment.netRentIncome,
      0
    );
    const totalLoansPrincipleLeft = apartments.reduce(
      (sum, apartment) => sum + apartment.remainingPrincipal,
      0
    );

    const totalMonthlyPassiveIncome =
      totalRentIncome - totalMonthlyLoansPayments;

    const totalMonthlyPassiveIncomeAfterTaxes = apartments.reduce(
      (sum, apartment) =>
        sum +
        (apartment.netRentIncomeAfterTaxes - apartment.monthlyLoanPayment),
      0
    );

    let numOfApartmentsToSellForCoveringLoan = 0;
    let apartmentsToSellTotalPrice = 0;
    let apartmentsToSellTotalPriceAfterTaxes = 0;
    for (let i = 0; i < apartments.length; i++) {
      if (
        apartmentsToSellTotalPriceAfterTaxes + investmentStatus.money >=
        totalLoansPrincipleLeft
      ) {
        break;
      }
      apartmentsToSellTotalPrice += apartments[i].priceAfterGrowth;
      apartmentsToSellTotalPriceAfterTaxes += apartments[i].pricieAfterTaxes;
      numOfApartmentsToSellForCoveringLoan++;
    }
    const totalApartmentsAfterSellingApartmentsForCoveringLoans =
      apartments.length - numOfApartmentsToSellForCoveringLoan;
    const moneyLeftWithCoveringLoans =
      apartmentsToSellTotalPriceAfterTaxes +
      investmentStatus.money -
      totalLoansPrincipleLeft;

    const totalMonthlyPassiveIncomeAfterCoveringLoans = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .reduce((sum, apartment) => sum + apartment.netRentIncome, 0);

    const totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .reduce((sum, apartment) => sum + apartment.netRentIncomeAfterTaxes, 0);

    const totalValueAfterCoveringLoans = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .reduce((sum, apartment) => sum + apartment.priceAfterGrowth, 0);

    const totalValueAfterCoveringLoansAfterTaxes = apartments
      .slice(numOfApartmentsToSellForCoveringLoan)
      .reduce(
        (sum, apartment) => sum + getApartmentPriceAfterTaxes(apartment),
        0
      );

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
      money: investmentStatus.money,
      monthlyDetails: monthlyDetails,
      totalApartmentsAfterSellingApartmentsForCoveringLoans,
      moneyLeftWithCoveringLoans,
    });
  };

  //   while (month <= totalMonths) {
  //     while (money + loanAmount >= apartmentPrice) {
  //       let yearsHeld = (totalMonths + 1 - month) / 12;
  //       if (inputs.sellApartmentWhenLoanIsOver) {
  //         yearsHeld = Math.min(loanTimeYears, yearsHeld);
  //       }

  //       let priceAfterGrowth = getApartmentPriceAfterGrowth(yearsHeld);

  //       let newApartment = {
  //         id: crypto.randomUUID(),
  //         boughtMonth: month,
  //         loanEndTime: loanEndTime,
  //         remainingPrincipal,
  //         payments,
  //         price: apartmentPrice,
  //         priceAfterGrowth: priceAfterGrowth,
  //         monthlyLoanPayment,
  //         netRentIncome: strategy.netRentIncome,
  //         pricieAfterTaxes: apartment.price,
  //       };

  //       apartments.push(newApartment);

  //       money -= apartmentPrice - loanAmount;

  //       if (apartments.length > maxApartments) {
  //         setError(`Inputs are leading to more than 1000 apartments`);
  //         return;
  //       }
  //     }

  //     let numOfSoldApartments = 0;
  //     let totalMoneyFromSoldApartments = 0;
  //     let totalMoneyFromSoldApartmentsAfterTaxes = 0;
  //     apartmentsToSell = getApartmentsToSell(apartments, month);
  //     if (investmentStatus.sellApartmentWhenLoanIsOver) {
  //       apartments.forEach((apartment) => {
  //         if (isLoanOver(apartment, month)) {
  //           numOfSoldApartments++;
  //           totalMoneyFromSoldApartments += apartment.priceAfterGrowth;
  //           totalMoneyFromSoldApartmentsAfterTaxes =
  //             getApartmentPriceAfterTaxes(apartment);
  //         }
  //       });
  //       apartments = apartments.filter(
  //         (apartment) => !isLoanOver(apartment, month)
  //       );
  //     }

  //     money += totalMoneyFromSoldApartmentsAfterTaxes;

  //     updateApartmentMonthlyIncome(month, apartments);
  //     const incomeFromRent = apartments.reduce(
  //       (sum, apt) => sum + apt.netRentIncome,
  //       0
  //     );

  //     const totalMonthlyLoansPayments = apartments.reduce(
  //       (sum, apartment) => sum + getLoanMonthlyPayment(apartment, month),
  //       0
  //     );

  //     const incomeFromRentAfterTaxes = getRentIncomeAfterTaxes(
  //       incomeFromRent,
  //       inputs.yearlyRentTaxesInPercent
  //     );

  //     let totalIncome =
  //       monthlyContribution +
  //       incomeFromRentAfterTaxes -
  //       totalMonthlyLoansPayments;

  //     money += totalIncome;

  //     monthlyDetails.push({
  //       month,
  //       money,
  //       totalIncome,
  //       incomeFromRent,
  //       incomeFromRentAfterTaxes,
  //       totalMonthlyLoansPayments,
  //       numOfApartments: apartments.length,
  //       numOfSoldApartments,
  //       totalMoneyFromSoldApartments,
  //       totalMoneyFromSoldApartmentsAfterTaxes,
  //     });

  //     month++;
  //   }
  //   updateApartmentMonthlyIncome(month, apartments);

  //   const totalValue = apartments.reduce(
  //     (acc, apt) => acc + apt.priceAfterGrowth,
  //     0
  //   );
  //   const totalValueAfterTaxes = apartments.reduce(
  //     (acc, apt) => acc + getApartmentPriceAfterTaxes(apt),
  //     0
  //   );

  //   const totalMonthlyLoansPayments = apartments.reduce(
  //     (sum, apartment) => sum + getLoanMonthlyPayment(apartment, month),
  //     0
  //   );

  //   const totalRentIncome = apartments
  //     .map((a) => a.netRentIncome)
  //     .reduce((a, b) => a + b, 0);
  //   const totalLoansPrincipleLeft = apartments.reduce(
  //     (acc, apt) => acc + apt.remainingPrincipal,
  //     0
  //   );

  //   const totalMonthlyPassiveIncome =
  //     totalRentIncome - totalMonthlyLoansPayments;

  //   const totalMonthlyPassiveIncomeAfterTaxes =
  //     getRentIncomeAfterTaxes(
  //       totalRentIncome,
  //       inputs.yearlyRentTaxesInPercent
  //     ) - totalMonthlyLoansPayments;

  //   let numOfApartmentsToSellForCoveringLoan = 0;
  //   let apartmentsToSellTotalPrice = 0;
  //   let apartmentsToSellTotalPriceAfterTaxes = 0;
  //   for (let i = 0; i < apartments.length; i++) {
  //     if (
  //       apartmentsToSellTotalPriceAfterTaxes + money >=
  //       totalLoansPrincipleLeft
  //     ) {
  //       break;
  //     }
  //     apartmentsToSellTotalPrice += apartments[i].priceAfterGrowth;
  //     apartmentsToSellTotalPriceAfterTaxes += getApartmentPriceAfterTaxes(
  //       apartments[i]
  //     );
  //     numOfApartmentsToSellForCoveringLoan++;
  //   }
  //   const totalApartmentsAfterSellingApartmentsForCoveringLoans =
  //     apartments.length - numOfApartmentsToSellForCoveringLoan;
  //   const moneyLeftWithCoveringLoans =
  //     apartmentsToSellTotalPriceAfterTaxes + money - totalLoansPrincipleLeft;

  //   const totalMonthlyPassiveIncomeAfterCoveringLoans = apartments
  //     .slice(numOfApartmentsToSellForCoveringLoan)
  //     .map((apartment) =>
  //       calculateRentIncome(totalMonths + 1, apartment.boughtMonth)
  //     )
  //     .reduce((a, b) => a + b, 0);
  //   const totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes =
  //     getRentIncomeAfterTaxes(
  //       totalMonthlyPassiveIncomeAfterCoveringLoans,
  //       inputs.yearlyRentTaxesInPercent
  //     );

  //   const totalValueAfterCoveringLoans = apartments
  //     .slice(numOfApartmentsToSellForCoveringLoan)
  //     .reduce((acc, apt) => acc + apt.priceAfterGrowth, 0);

  //   const totalValueAfterCoveringLoansAfterTaxes = apartments
  //     .slice(numOfApartmentsToSellForCoveringLoan)
  //     .reduce((acc, apt) => acc + getApartmentPriceAfterTaxes(apt), 0);

  //   setResults({
  //     totalApartments: apartments.length,
  //     totalValue,
  //     totalMonthlyPassiveIncome,
  //     totalMonthlyPassiveIncomeAfterTaxes,
  //     totalValueAfterTaxes,
  //     totalValueAfterCoveringLoans,
  //     totalValueAfterCoveringLoansAfterTaxes,
  //     totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes,
  //     apartmentsToSellTotalPrice,
  //     apartmentsToSellTotalPriceAfterTaxes,
  //     totalMonthlyPassiveIncomeAfterCoveringLoans,
  //     totalLoansPrincipleLeft,
  //     apartments,
  //     money: money,
  //     monthlyDetails: monthlyDetails,
  //     totalApartmentsAfterSellingApartmentsForCoveringLoans,
  //     moneyLeftWithCoveringLoans,
  //   });
  // };

  return (
    <div>
      <div className="error-message">
        {error && <p className="error-text">Error: {error}</p>}
        {!error && <p className="valid-text">Valid Inputs</p>}
      </div>
      {!error && (
        <>
          <button onClick={toggleSummary}>Show Summary</button>
          {showSummary && (
            <InvestmentSummary results={results}></InvestmentSummary>
          )}
        </>
      )}
    </div>
  );
};

export default InvestmentForcaster;
