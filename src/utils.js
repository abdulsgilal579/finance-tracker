export function calculate503020(totalEarnings) {
  return {
    needs: totalEarnings * 0.5,
    wants: totalEarnings * 0.3,
    savings: totalEarnings * 0.2,
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getWantsSplit(wantsTotal, numGoals) {
  if (numGoals === 0) return 0;
  return wantsTotal / numGoals;
}
