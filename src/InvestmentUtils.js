export const getRentIncomeAfterTaxes = (income, yearlyRentTaxesInPercent) => {
  return income * (1 - yearlyRentTaxesInPercent / 100);
};

export const getLoanMonthlyPayment = (apartment, month) =>
  month > apartment.loanEndTime ? 0 : apartment.monthlyLoanPayment;
