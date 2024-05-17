export class Constants {
  static DEFAULT_STRATEGY_INPUTS = {
    initialMoney: 200000,
    apartmentPrice: 400000,
    netYearlyRentIncomeInPercent: 5,
    netYearlyRentIncomeGrowthInPercent: 3,
    yearlyRentTaxesInPercent: 10,
    loanAmountInPercent: 50,
    loanInterestRate: 6,
    loanTimeYears: 15,
    investmentTimeYears: 15,
    monthlyContribution: 10000,
    priceGrowthRate: 6,
    capitalGainsTaxPercent: 25,
  };

  static DEFAULT_SUMMARY_RESULTS = {
    totalApartments: 0,
    totalValue: 0,
    totalValueAfterTaxes: 0,
    totalValueAfterCoveringLoans: 0,
    totalValueAfterCoveringLoansAfterTaxes: 0,
    totalMonthlyPassiveIncome: 0,
    totalMonthlyPassiveIncomeAfterTaxes: 0,
    totalMonthlyPassiveIncomeAfterCoveringLoans: 0,
    totalMonthlyPassiveIncomeAfterCoveringLoansAfterTaxes: 0,
    totalLoansPrincipleLeft: 0,
    apartments: [],
    monthlyDetails: [],
    money: 0,
    totalApartmentsAfterSellingApartmentsForCoveringLoans: 0,
    moneyLeftWithCoveringLoans: 0,
  };
}
