// App.js
import React from "react";
import "./App.css";

const InvestmentSummary = ({ results }) => {
  return (
    <>
      <h2>Summary</h2>
      <div className="flex-table results-table">
        <div className="flex-row header">
          <div className="cell">Subject</div>
          <div className="cell">Value</div>
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
          <div className="cell">{results?.money?.toLocaleString()}</div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Monthly Passive Income:</div>
          <div className="cell">
            {results.totalMonthlyPassiveIncome.toLocaleString()}
          </div>
        </div>
        <div className="flex-row">
          <div className="cell">Total Monthly Passive Income After Taxes:</div>
          <div className="cell">
            {results.totalMonthlyPassiveIncomeAfterTaxes.toLocaleString()}
          </div>
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
          <div className="cell">Total Monthly Passive Income After Taxes:</div>
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
          <div className="cell">Price After Growth</div>
        </div>
        {results.apartments.map((apartment, index) => (
          <div key={index} className="flex-row">
            <div className="cell">{index + 1}</div>
            <div className="cell">{apartment.boughtMonth}</div>
            <div className="cell">{apartment.loanEndTime}</div>
            <div className="cell">
              {apartment.remainingPrincipal.toLocaleString()}
            </div>
            <div className="cell">
              {apartment.monthlyLoanPayment.toLocaleString()}
            </div>
            <div className="cell">
              {apartment.netRentIncome.toLocaleString()}
            </div>
            <div className="cell">
              {apartment.netRentIncomeAfterTaxes.toLocaleString()}
            </div>
            <div className="cell">
              {apartment.priceAfterGrowth.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <h2>Monthly Details</h2>
      <div className="table-container">
        <table className="monthly-details-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Money</th>
              <th>Total Income</th>
              <th>Income Rent After Taxes</th>
              <th>Income Rent</th>
              <th>Total Monthly Loans</th>
              <th>Num of Apartments</th>
              <th>Num of Sold Apartments</th>
              <th>Sold Apartments Money After Taxes</th>
              <th>Sold Apartments Money</th>
            </tr>
          </thead>
          <tbody>
            {results?.monthlyDetails?.map((details, index) => (
              <tr key={index}>
                <td>{details.month}</td>
                <td>{details.money.toLocaleString()}</td>
                <td>{details.totalIncome.toLocaleString()}</td>
                <td>{details.incomeFromRentAfterTaxes.toLocaleString()}</td>
                <td>{details.incomeFromRent.toLocaleString()}</td>
                <td>{details.totalMonthlyLoansPayments.toLocaleString()}</td>
                <td>{details.numOfApartments}</td>
                <td>{details.numOfSoldApartments.toLocaleString()}</td>
                <td>{details.totalMoneyFromSoldApartmentsAfterTaxes}</td>
                <td>{details.totalMoneyFromSoldApartments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default InvestmentSummary;
