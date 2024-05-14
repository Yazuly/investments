import { useEffect, useState } from "react";
import "./App.css"; // Make sure this path matches your actual CSS file location

const InvestmentStrategy = (props) => {
  const [strategy, setStrategy] = useState({});

  useEffect(() => {
    setStrategy(props.strategy);
  }, [props.strategy]);

  const maxLoanAmountInPercent = 90;

  const handleInitialMoneyChange = (event) => {
    props.updateInputs({
      ...strategy,
      initialMoney: parseFloat(event.target.value),
    });
  };

  const handleApartmentPriceChange = (event) => {
    props.updateInputs({
      ...strategy,
      apartmentPrice: Math.max(parseFloat(event.target.value)),
    });
  };

  const handleNetYearlyRentIncomeInPercentChange = (event) => {
    props.updateInputs({
      ...strategy,
      netYearlyRentIncomeInPercent: parseFloat(event.target.value),
    });
  };

  const handleYearlyRentTaxesInPercentChange = (event) => {
    props.updateInputs({
      ...strategy,
      yearlyRentTaxesInPercent: parseFloat(event.target.value),
    });
  };

  const handleLoanAmountInPercentChange = (event) => {
    const value = Math.min(
      parseFloat(event.target.value),
      maxLoanAmountInPercent
    );
    props.updateInputs({
      ...strategy,
      loanAmountInPercent: value,
    });
  };

  const handleLoanInterestRateChange = (event) => {
    const value = Math.max(parseFloat(event.target.value), 1);
    props.updateInputs({ ...strategy, loanInterestRate: value });
  };

  const handleLoanTimeYearsChange = (event) => {
    const value = Math.max(parseFloat(event.target.value), 1);
    props.updateInputs({ ...strategy, loanTimeYears: value });
  };

  const handleInvestmentTimeYearsChange = (event) => {
    props.updateInputs({
      ...strategy,
      investmentTimeYears: parseFloat(event.target.value),
    });
  };

  const handleMonthlyContributionChange = (event) => {
    props.updateInputs({
      ...strategy,
      monthlyContribution: parseFloat(event.target.value),
    });
  };

  const handlePriceGrowthRateChange = (event) => {
    props.updateInputs({
      ...strategy,
      priceGrowthRate: parseFloat(event.target.value),
    });
  };

  const handleCapitalGainsTaxPercentChange = (event) => {
    props.updateInputs({
      ...strategy,
      capitalGainsTaxPercent: parseFloat(event.target.value),
    });
  };

  const sellApartmentWhenLoanIsOverChange = (event) => {
    props.updateInputs({
      ...strategy,
      sellApartmentWhenLoanIsOver: !strategy.sellApartmentWhenLoanIsOver,
    });
  };

  return (
    <div class="input-table">
      <button onClick={props.removeStrategy}>remove</button>
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
              value={strategy.initialMoney}
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
              value={strategy.apartmentPrice}
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
              value={strategy.netYearlyRentIncomeInPercent}
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
              value={strategy.yearlyRentTaxesInPercent}
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
              value={strategy.loanAmountInPercent}
              onChange={handleLoanAmountInPercentChange}
            />
          </td>
        </tr>
        <tr>
          <td>
            <label for="loanInterestRate">Loan interest rate in percent</label>
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
            <label for="loanTimeYears">Loan duration in years</label>
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
            <label for="investmentTimeYears">
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
            <label for="monthlyContribution">
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
            <label for="priceGrowthRate">
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
            <label for="capitalGainsTaxPercent">
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
              checked={strategy.sellApartmentWhenLoanIsOver}
              onChange={sellApartmentWhenLoanIsOverChange}
            />
          </td>
        </tr>
      </table>
    </div>
  );
};

export default InvestmentStrategy;
