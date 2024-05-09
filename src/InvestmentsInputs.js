import { useEffect, useState } from "react";
import "./App.css"; // Make sure this path matches your actual CSS file location

const InvestmentInputs = (props) => {
  const [inputs, setInputs] = useState(props.inputs);

  useEffect(() => {
    props.setInputs(inputs);
  }, [inputs]);

  const maxLoanAmountInPercent = 90;

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

  return (
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
            <label for="loanInterestRate">Loan interest rate in percent</label>
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
  );
};

export default InvestmentInputs;
