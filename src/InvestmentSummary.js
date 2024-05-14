import "./App.css"; // Make sure this path matches your actual CSS file location
import { getRentIncomeAfterTaxes } from "./InvestmentUtils";

const InvestmentSummary = (props) => {
  const results = props.results;

  return (
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
        <div className="cell">Total Monthly Passive Income After Taxes:</div>
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
          <div className="cell">Price After Growth</div>{" "}
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
              {apartment.loanMonthlyPayment.toLocaleString()}
            </div>
            <div className="cell">
              {apartment.netRentIncome.toLocaleString()}
            </div>
            <div className="cell">
              {getRentIncomeAfterTaxes(
                apartment.netRentIncome
              ).toLocaleString()}
            </div>
            <div className="cell">
              {apartment.priceAfterGrowth.toLocaleString()}
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
            <div className="cell">{details.totalIncome.toLocaleString()}</div>
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
            <div className="cell">{details.totalMoneyFromSoldApartments}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default InvestmentSummary;
