import React, { useEffect, useState } from 'react';


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
    rentIncomeYearlyIncrease: 100
  });

  const [results, setResults] = useState({
    totalApartments: 0,
    totalValue: 0,
    totalMonthlyPassiveIncome: 0,
    totalLoansLeft: 0,
    apartments: [],
    monthlyDetails:[],
    totalApartmentsAfterSellingApartmentsForCoveringLoans:0,
    moneyLeftWithCoveringLoans:0
  });

  const maxLoanToApartmentPriceRatio = 0.9

  const handleInitialMoneyChange = (event) => {
    setInputs(inputs => ({ ...inputs, initialMoney: parseFloat(event.target.value) }));
  };

  const handleApartmentPriceChange = (event) => {
    setInputs(inputs => ({ ...inputs, apartmentPrice: parseFloat(event.target.value) }));
  };

  const handleNetRentIncomeChange = (event) => {
    setInputs(inputs => ({ ...inputs, netRentIncome: parseFloat(event.target.value) }));
  };

  const hanldeRentIncomeYearlyIncrease = (event) => {
    setInputs(inputs => ({ ...inputs, rentIncomeYearlyIncrease: parseFloat(event.target.value) }));
  };

  const handleLoanAmountChange = (event) => {
    const value = Math.min(parseFloat(event.target.value), inputs.apartmentPrice * maxLoanToApartmentPriceRatio);
    setInputs(inputs => ({ ...inputs, loanAmount: value }));
  };

  const handleLoanInterestRateChange = (event) => {
    setInputs(inputs => ({ ...inputs, loanInterestRate: parseFloat(event.target.value) }));
  };

  const handleLoanTimeYearsChange = (event) => {
    setInputs(inputs => ({ ...inputs, loanTimeYears: parseFloat(event.target.value) }));
  };

  const handleInvestmentTimeYearsChange = (event) => {
    setInputs(inputs => ({ ...inputs, investmentTimeYears: parseFloat(event.target.value) }));
  };

  const handleMonthlyContributionChange = (event) => {
    setInputs(inputs => ({ ...inputs, monthlyContribution: parseFloat(event.target.value) }));
  };

  const handlePriceGrowthRateChange = (event) => {
    setInputs(inputs => ({ ...inputs, priceGrowthRate: parseFloat(event.target.value) }));
  };

  useEffect(() => {
    simulateInvestment();
  }, [inputs]); // Dependency array includes `inputs`, so the effect runs any time `inputs` changes


  const calculateLoanPayment = (loanAmount, rate, years) => {
    const monthlyRate = rate / 12 / 100;
    const payments = years * 12;
    return (
      (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments))
    );
  };

  const updateApartmentMonthlyIncome = (month,apartments) => {
    apartments.forEach(apartment => {
      let loanReturn = (month >= apartment.loanEndTime ? 0 : apartment.monthlyLoanPayment)
      let rentIncome = inputs.netRentIncome + Math.floor((month-apartment.boughtMonth)/12)*inputs.rentIncomeYearlyIncrease
      apartment.netRentIncome =  rentIncome - loanReturn
    });
  }

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
  
    let month = 0;
    const totalMonths = investmentTimeYears * 12;
    let money = initialMoney;
    let totalApartments = 0;
    let apartments = [];
    let monthlyDetails = [] 

    while (month <= totalMonths) {
      updateApartmentMonthlyIncome(month,apartments)
      
      let incomeFromRent = apartments.reduce((sum, apt) => sum + apt.netRentIncome, 0);
      let totalIncome = monthlyContribution + incomeFromRent
      money += totalIncome

      monthlyDetails.push({month,money, totalIncome, incomeFromRent, numOfApartments:apartments.length})
      
      
      while(money + loanAmount >= apartmentPrice) {
        let monthlyLoanPayment = calculateLoanPayment(
          loanAmount,
          loanInterestRate,
          loanTimeYears
        );
        
        
        let yearsHeld = (totalMonths+1-month)/12;
        let priceAfterGrowth = apartmentPrice * Math.pow(1 + (priceGrowthRate / 100), yearsHeld);
  

        let loanEndTime = month + loanTimeYears * 12
        let loanBalance = monthlyLoanPayment * Math.max(0,Math.min(loanEndTime-totalMonths))
        let newApartment = {
          boughtMonth: month,
          loanEndTime: loanEndTime,
          loanBalance: loanBalance,
          loanPayment: monthlyLoanPayment,
          price: apartmentPrice,
          priceAfterGrowth: priceAfterGrowth,
          monthlyLoanPayment: monthlyLoanPayment,
          netRentIncome: netRentIncome - monthlyLoanPayment,
        };

        apartments.push(newApartment);

        money -= (apartmentPrice-loanAmount);
        totalApartments++;
      }
      

      month++;
    }

    const totalValue = apartments.reduce((acc, apt) => acc + apt.priceAfterGrowth, 0)
    const totalMonthlyPassiveIncome = apartments.map(a => a.netRentIncome).reduce((a, b) => a + b, 0)
    const totalLoansLeft = apartments.reduce((acc, apt) => acc + apt.loanBalance, 0)

    let numOfApartmentsToSellForCoveringLoan = 0
    let apartmentsToSellTotalPrice = 0
    for(let i = 0 ; i < apartments.length ; i++){
      if(apartmentsToSellTotalPrice+money >= totalLoansLeft){
        break;
      }
      apartmentsToSellTotalPrice+=apartments[i].priceAfterGrowth
      numOfApartmentsToSellForCoveringLoan++
    }
    const totalApartmentsAfterSellingApartmentsForCoveringLoans = totalApartments - numOfApartmentsToSellForCoveringLoan
    const moneyLeftWithCoveringLoan = apartmentsToSellTotalPrice + money - totalLoansLeft
    

    setResults({
      totalApartments,
      totalValue: totalValue,
      totalMonthlyPassiveIncome: totalMonthlyPassiveIncome,
      totalLoansLeft: totalLoansLeft,
      apartments, 
      money:money,
      monthlyDetails:monthlyDetails,
      totalApartmentsAfterSellingApartmentsForCoveringLoans:totalApartmentsAfterSellingApartmentsForCoveringLoans,
      moneyLeftWithCoveringLoans:moneyLeftWithCoveringLoan
    });
  };

  return (
    <div>
      <h1>Real Estate Investment Simulator</h1>
      <div>
      <div className="input-group">
        <label>Initial Money</label>
        <input type="number" name="initialMoney" value={inputs.initialMoney} onChange={handleInitialMoneyChange} />
      </div>
      <div className="input-group">
        <label>Apartment Price</label>
        <input type="number" name="apartmentPrice" value={inputs.apartmentPrice} onChange={handleApartmentPriceChange} />
      </div>
      <div className="input-group">
        <label>Net Rent Income</label>
        <input type="number" name="netRentIncome" value={inputs.netRentIncome} onChange={handleNetRentIncomeChange} />
      </div>
      <div className="input-group">
        <label>Ret Income Yearly Increase</label>
        <input type="number" name="netRentIncome" value={inputs.rentIncomeYearlyIncrease} onChange={hanldeRentIncomeYearlyIncrease} />
      </div>
      <div className="input-group">
        <label>Loan Amount</label>
        <input type="number" name="loanAmount" value={inputs.loanAmount} onChange={handleLoanAmountChange} />
      </div>
      <div className="input-group">
        <label>Loan Interest Rate</label>
        <input type="number" name="loanInterestRate" value={inputs.loanInterestRate} onChange={handleLoanInterestRateChange} />
      </div>
      <div className="input-group">
        <label>Loan Time Years</label>
        <input type="number" name="loanTimeYears" value={inputs.loanTimeYears} onChange={handleLoanTimeYearsChange} />
      </div>
      <div className="input-group">
        <label>Investment Time Years</label>
        <input type="number" name="investmentTimeYears" value={inputs.investmentTimeYears} onChange={handleInvestmentTimeYearsChange} />
      </div>
      <div className="input-group">
        <label>Monthly Contribution</label>
        <input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleMonthlyContributionChange} />
      </div>
      <div className="input-group">
        <label>Price Growth Rate</label>
        <input type="number" name="priceGrowthRate" value={inputs.priceGrowthRate} onChange={handlePriceGrowthRateChange} />
      </div>
    </div>
      <h2>Results</h2>
      <div className="flex-table results-table">
        <div className="flex-row">
          <div className="cell">Total Apartments:</div>
          <div className="cell">{results.totalApartments}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Value:</div>
          <div className="cell">${results.totalValue.toLocaleString()}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Monthly Passive Income:</div>
          <div className="cell">${results.totalMonthlyPassiveIncome.toLocaleString()}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Loans Left to Pay:</div>
          <div className="cell">${results.totalLoansLeft.toLocaleString()}</div>
        </div>
        <div className="flex-row">
          <div className="cell">TotalValue - LoansLeftToPay:</div>
          <div className="cell">${(results.totalValue-results.totalLoansLeft).toLocaleString()}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Money:</div>
          <div className="cell">${results?.money?.toLocaleString() || 0}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Apartments After Selling Apartments For Covering Loans :</div>
          <div className="cell">${results?.totalApartmentsAfterSellingApartmentsForCoveringLoans?.toLocaleString() || 0}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Money Left After Covering Loan With Apartments :</div>
          <div className="cell">${results?.moneyLeftWithCoveringLoans?.toLocaleString() || 0}</div>
        </div>
      </div>
      <br></br>
      <div className="flex-table">
        <div className="flex-row header">
          <div className="cell">Loan Index</div>
          <div className="cell">Loan Start Month</div>
          <div className="cell">Loan End Month</div>
          <div className="cell">Remaining Loan Balance</div>
          <div className="cell">Net Rent Income On The End</div>
          <div className="cell">Price After Growth</div> {/* New column for grown price */}
        </div>
        {results.apartments.map((apt, index) => (
          <div key={index} className="flex-row">
            <div className="cell">{index + 1}</div>
            <div className="cell">{apt.boughtMonth + 1}</div>
            <div className="cell">{apt.loanEndTime}</div>
            <div className="cell">{apt.loanBalance.toFixed(2)}</div>
            <div className="cell">{apt.netRentIncome.toFixed(2)}</div>
            <div className="cell">{apt.priceAfterGrowth.toFixed(2)}</div> {/* Display grown price */}
          </div>
        ))}
      </div>
      <br></br>
      <div className="flex-table">
        <div className="flex-row header">
        <div className="cell">month</div>
          <div className="cell">money</div>
          <div className="cell">totalIncome</div>
          <div className="cell">incomeFromRent</div>
          <div className="cell">numOfApartments</div>
        </div>
        {results?.monthlyDetails?.map((apt, index) => (
          <div key={index} className="flex-row">
            <div className="cell">{apt.month}</div>
            <div className="cell">{apt.money.toFixed(2)}</div>
            <div className="cell">{apt.totalIncome.toFixed(2)}</div>
            <div className="cell">{apt.incomeFromRent.toFixed(2)}</div>
            <div className="cell">{apt.numOfApartments}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentSimulator;
