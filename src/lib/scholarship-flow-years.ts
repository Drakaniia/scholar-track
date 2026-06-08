type AcademicYearLike = {
  year: string;
};

const FLOW_WINDOW_YEARS = 5;
const FUTURE_START_YEAR_COUNT = 5;

export function getScholarshipFlowEndYear(startYear: number) {
  return startYear + FLOW_WINDOW_YEARS - 1;
}

export function getAcademicYearStartYear(academicYear: string) {
  const match = academicYear.match(/\d{4}/);
  if (!match) return null;

  const year = Number(match[0]);
  return Number.isInteger(year) ? year : null;
}

export function getDefaultScholarshipFlowStartYear(date = new Date()) {
  return date.getFullYear() - (FLOW_WINDOW_YEARS - 1);
}

export function buildScholarshipFlowStartYears(
  academicYears: AcademicYearLike[] = [],
  currentYear = new Date().getFullYear()
) {
  const startYears = new Set<number>();
  const defaultStartYear = currentYear - (FLOW_WINDOW_YEARS - 1);

  for (let year = defaultStartYear; year <= currentYear + FUTURE_START_YEAR_COUNT; year += 1) {
    startYears.add(year);
  }

  academicYears.forEach((academicYear) => {
    const startYear = getAcademicYearStartYear(academicYear.year);
    if (startYear) {
      startYears.add(startYear);
    }
  });

  return Array.from(startYears).sort((left, right) => left - right);
}
