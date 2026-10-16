export const PROJECT_START_DATE = '2025-09-01';
export const PROJECT_END_DATE = '2026-07-31';
export const PROJECT_MONTHS = 11;

export const PROJECT_END = new Date(`${PROJECT_END_DATE}T12:00:00`);

export const cleanPortfolioLabel = (value: string | null | undefined) =>
  (value || '').replace('DEMO · Musanze Town Buildings · ', '').replace(' · DEMO', '');
