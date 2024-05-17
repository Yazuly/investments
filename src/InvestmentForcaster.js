import { useEffect, useState } from "react";

import "./App.css"; // Make sure this path matches your actual CSS file location
import {
  getLoanMonthlyPayment,
  getRentIncomeAfterTaxes,
} from "./InvestmentUtils";
import { Constants } from "./contants";

const InvestmentForcaster = (props) => {
  const onResults = props.onResults;
  const [strategies, setStrategies] = useState([]);
  const [results, setResults] = useState(Constants.DEFAULT_SUMMARY_RESULTS);

  const maxApartments = 300;

  useEffect(() => {
    setStrategies(props.strategies);
  }, [props.strategies]);

  useEffect(() => {
    const errorMessage = validateInputs();
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

  useEffect(() => {
    props.onError(error);
  }, [error]); // Dependency array includes `inputs`

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
    const yearsHeald = Math.floor((month - apartment.boughtMonth) / 12);
    const growthFactor = Math.pow(
      1 + apartment.strategy.netYearlyRentIncomeGrowthInPercent / 100,
      yearsHeald
    );

    return (
      (growthFactor *
        (apartment.initialPrice *
          (apartment.strategy.netYearlyRentIncomeInPercent / 100))) /
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
      Math.floor((month - apartment.boughtMonth) / 12)
    );

  const updateRemainingPrinciple = (apartment, month) => {
    if (isLoanOver(apartment, month)) {
      apartment.remainingPrincipal = 0;
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
    let loanAmount = getLoanAmount(strategy);
    const { monthlyLoanPayment, monthlyRate, numberOfPayments } =
      calculateLoanPaymentsDetails(
        loanAmount,
        strategy.loanInterestRate,
        strategy.loanTimeYears
      );

    let loanEndTime = investmentStatus.month - 1 + strategy.loanTimeYears * 12;
    const payments = calculateLoanPayments(
      loanAmount,
      monthlyLoanPayment,
      monthlyRate,
      numberOfPayments
    );

    let apartment = {
      id: crypto.randomUUID(),
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
    investmentStatus.apartments.push(apartment);
    investmentStatus.money -= strategy.apartmentPrice - getLoanAmount(strategy);
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
    updateApartments(investmentStatus);
  };

  const getApartmentsToSell = (apartments, month) => {
    return apartments.filter(
      (apartment) =>
        isLoanOver(apartment, month) &&
        apartment.strategy.sellApartmentWhenLoanIsOver
    );
  };

  const getLoanAmount = (strategy) =>
    (strategy.loanAmountInPercent / 100) * strategy.apartmentPrice;

  const simulateInvestment = () => {
    if (!strategies || strategies.length === 0) {
      setResults(Constants.DEFAULT_SUMMARY_RESULTS);
      return;
    }

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
      let loanAmount = getLoanAmount(strategy);
      let totalMonths = strategy.investmentTimeYears * 12;
      for (let i = 0; i < totalMonths; i++) {
        while (investmentStatus.money + loanAmount >= strategy.apartmentPrice) {
          buyApartment(investmentStatus);
          if (investmentStatus.apartments.length > maxApartments) {
            setError(`Inputs are leading to more than 1000 apartments`);
            return;
          }
        }

        updateInvestmentStatus(investmentStatus);
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
          (sum, apartment) => sum + apartment.netRentIncome,
          0
        );

        const totalMonthlyLoansPayments = investmentStatus.apartments.reduce(
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
      }
    });

    let apartments = investmentStatus.apartments;

    updateInvestmentStatus(investmentStatus);

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
};

export default InvestmentForcaster;
