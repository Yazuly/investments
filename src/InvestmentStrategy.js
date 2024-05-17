import { useEffect, useState } from "react";
import "./App.css"; // Make sure this path matches your actual CSS file location

const InvestmentStrategy = (props) => {
  const [strategy, setStrategy] = useState({});

  useEffect(() => {
    setStrategy(props.strategy);
  }, [props.strategy]);

  const maxLoanAmountInPercent = 90;

  const handleInitialMoneyChange = (event) => {
    props.updateStrategy({
      ...strategy,
      initialMoney: parseFloat(event.target.value),
    });
  };

  const handleApartmentPriceChange = (event) => {
    props.updateStrategy({
      ...strategy,
      apartmentPrice: Math.max(parseFloat(event.target.value)),
    });
  };

  const handleNetYearlyRentIncomeInPercentChange = (event) => {
    props.updateStrategy({
      ...strategy,
      netYearlyRentIncomeInPercent: parseFloat(event.target.value),
    });
  };

  const handleNetYearlyRentIncomeGrowthInPercentChange = (event) => {
    props.updateStrategy({
      ...strategy,
      netYearlyRentIncomeGrowthInPercent: parseFloat(event.target.value),
    });
  };

  const handleYearlyRentTaxesInPercentChange = (event) => {
    props.updateStrategy({
      ...strategy,
      yearlyRentTaxesInPercent: parseFloat(event.target.value),
    });
  };

  const handleLoanAmountInPercentChange = (event) => {
    const value = Math.min(
      parseFloat(event.target.value),
      maxLoanAmountInPercent
    );
    props.updateStrategy({
      ...strategy,
      loanAmountInPercent: value,
    });
  };

  const handleLoanInterestRateChange = (event) => {
    const value = Math.max(parseFloat(event.target.value), 1);
    props.updateStrategy({ ...strategy, loanInterestRate: value });
  };

  const handleLoanTimeYearsChange = (event) => {
    const value = Math.max(parseFloat(event.target.value), 1);
    props.updateStrategy({ ...strategy, loanTimeYears: value });
  };

  const handleInvestmentTimeYearsChange = (event) => {
    props.updateStrategy({
      ...strategy,
      investmentTimeYears: parseFloat(event.target.value),
    });
  };

  const handleMonthlyContributionChange = (event) => {
    props.updateStrategy({
      ...strategy,
      monthlyContribution: parseFloat(event.target.value),
    });
  };

  const handlePriceGrowthRateChange = (event) => {
    props.updateStrategy({
      ...strategy,
      priceGrowthRate: parseFloat(event.target.value),
    });
  };

  const handleCapitalGainsTaxPercentChange = (event) => {
    props.updateStrategy({
      ...strategy,
      capitalGainsTaxPercent: parseFloat(event.target.value),
    });
  };

  const sellApartmentWhenLoanIsOverChange = (event) => {
    props.updateStrategy({
      ...strategy,
      sellApartmentWhenLoanIsOver: !strategy.sellApartmentWhenLoanIsOver,
    });
  };

  return (
    <div className="input-table">
      <button
        className="calculator-button remove-button"
        onClick={props.removeStrategy}
      >
        ×
      </button>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label htmlFor="initialCapital">Initial capital</label>
            </td>
            <td>
              <input
                type="number"
                id="initialMoney"
                name="initialMoney"
                value={strategy.initialMoney}
                onChange={handleInitialMoneyChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="apartmentPrice">Price of the apartment</label>
            </td>
            <td>
              <input
                type="number"
                id="apartmentPrice"
                name="apartmentPrice"
                value={strategy.apartmentPrice}
                onChange={handleApartmentPriceChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="netYearlyRentIncomeInPercent">
                Net yearly rent income in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="netYearlyRentIncomeInPercent"
                name="netYearlyRentIncomeInPercent"
                value={strategy.netYearlyRentIncomeInPercent}
                onChange={handleNetYearlyRentIncomeInPercentChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="netYearlyRentIncomeGrowthInPercent">
                Net yearly rent income growth in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="netYearlyRentIncomeGrowthInPercent"
                name="netYearlyRentIncomeGrowthInPercent"
                value={strategy.netYearlyRentIncomeGrowthInPercent}
                onChange={handleNetYearlyRentIncomeGrowthInPercentChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="yearlyRentTaxesInPercent">
                Yearly rental taxes in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="yearlyRentTaxesInPercent"
                name="yearlyRentTaxesInPercent"
                value={strategy.yearlyRentTaxesInPercent}
                onChange={handleYearlyRentTaxesInPercentChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="loanAmountInPercent">
                Loan amount in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="loanAmountInPercent"
                name="loanAmountInPercent"
                value={strategy.loanAmountInPercent}
                onChange={handleLoanAmountInPercentChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="loanInterestRate">
                Loan interest rate in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="loanInterestRate"
                name="loanInterestRate"
                value={strategy.loanInterestRate}
                onChange={handleLoanInterestRateChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="loanTimeYears">Loan duration in years</label>
            </td>
            <td>
              <input
                type="number"
                id="loanTimeYears"
                name="loanTimeYears"
                value={strategy.loanTimeYears}
                onChange={handleLoanTimeYearsChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="investmentTimeYears">
                Investment duration in years
              </label>
            </td>
            <td>
              <input
                type="number"
                id="investmentTimeYears"
                name="investmentTimeYears"
                value={strategy.investmentTimeYears}
                onChange={handleInvestmentTimeYearsChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="monthlyContribution">
                Monthly contribution to investment
              </label>
            </td>
            <td>
              <input
                type="number"
                id="monthlyContribution"
                name="monthlyContribution"
                value={strategy.monthlyContribution}
                onChange={handleMonthlyContributionChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="priceGrowthRate">
                Annual growth rate of property prices
              </label>
            </td>
            <td>
              <input
                type="number"
                id="priceGrowthRate"
                name="priceGrowthRate"
                value={strategy.priceGrowthRate}
                onChange={handlePriceGrowthRateChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="capitalGainsTaxPercent">
                Capital gains tax rate in percent
              </label>
            </td>
            <td>
              <input
                type="number"
                id="capitalGainsTaxPercent"
                name="capitalGainsTaxPercent"
                value={strategy.capitalGainsTaxPercent}
                onChange={handleCapitalGainsTaxPercentChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="sellApartmentWhenLoanIsOver">
                Sell Apartment When Loan Is Over
              </label>
            </td>
            <td>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="sellApartmentWhenLoanIsOver"
                  name="sellApartmentWhenLoanIsOver"
                  checked={strategy.sellApartmentWhenLoanIsOver}
                  onChange={sellApartmentWhenLoanIsOverChange}
                />
                <span className="slider"></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InvestmentStrategy;
