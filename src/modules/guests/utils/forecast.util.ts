export interface MonthlyCount {
  yearMonth: string; // 'YYYY-MM'
  count: number;
}

export interface ForecastResult {
  months: string[];
  predicted: number[];
  historical: number[];
  historicalMonths: string[];
}

// Transparent statistical forecast (linear trend + calendar-month seasonal
// index) rather than an ML model — a single hotel's booking volume is far too
// small a dataset to train/justify one.
export function computeForecast(
  series: MonthlyCount[],
  horizonMonths = 6,
): ForecastResult | null {
  if (series.length < 2) return null;

  const ys = series.map((s) => s.count);
  const xs = ys.map((_, i) => i);
  const { slope, intercept } = leastSquares(xs, ys);
  const seasonalIndex = computeSeasonalIndex(series);

  const [lastYear, lastMonth] = series[series.length - 1].yearMonth
    .split('-')
    .map(Number);

  const predicted: number[] = [];
  const months: string[] = [];

  for (let i = 1; i <= horizonMonths; i++) {
    const futureIndex = series.length - 1 + i;
    const trend = slope * futureIndex + intercept;

    const monthOffset = lastMonth - 1 + i;
    const futureYear = lastYear + Math.floor(monthOffset / 12);
    const futureMonthNum = (monthOffset % 12) + 1;
    const seasonal = seasonalIndex.get(futureMonthNum) ?? 1;

    predicted.push(Math.max(0, Math.round(trend * seasonal)));
    months.push(`${futureYear}-${String(futureMonthNum).padStart(2, '0')}`);
  }

  return {
    months,
    predicted,
    historical: ys.slice(-12),
    historicalMonths: series.slice(-12).map((s) => s.yearMonth),
  };
}

function leastSquares(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// Average count per calendar month relative to the overall average, so e.g.
// December can be predicted higher than a flat trend line would suggest.
// Needs at least ~2 years of spread to be meaningful; otherwise every month
// defaults to a neutral multiplier of 1 (pure trend, no seasonality).
function computeSeasonalIndex(series: MonthlyCount[]): Map<number, number> {
  const byMonth = new Map<number, number[]>();
  for (const { yearMonth, count } of series) {
    const monthNum = Number(yearMonth.split('-')[1]);
    if (!byMonth.has(monthNum)) byMonth.set(monthNum, []);
    byMonth.get(monthNum)!.push(count);
  }

  const overallAverage = series.reduce((sum, s) => sum + s.count, 0) / series.length;
  const hasEnoughSpread = series.length >= 24 && byMonth.size >= 6;

  const index = new Map<number, number>();
  for (let month = 1; month <= 12; month++) {
    const counts = byMonth.get(month);
    if (!hasEnoughSpread || overallAverage === 0 || !counts?.length) {
      index.set(month, 1);
      continue;
    }
    const monthAverage = counts.reduce((a, b) => a + b, 0) / counts.length;
    index.set(month, monthAverage / overallAverage);
  }

  return index;
}
