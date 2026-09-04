import { describe, expect, it } from 'vitest';

/**
 * The first live run bought nine articles instead of ten and reported "budget
 * exhausted at $0.0090" against a $0.01 budget. Binary floating point: after nine
 * purchases `spent` is 0.009000000000000001, so `spent + 0.001 > 0.01` is true.
 * The agent now counts in integer micro-dollars.
 */
describe('budget arithmetic', () => {
  const unit = 0.001;
  const budget = 0.01;

  it('demonstrates the float bug that cost us a purchase', () => {
    let spent = 0;
    let bought = 0;
    for (let i = 0; i < 20; i++) {
      if (spent + unit > budget) break;
      spent += unit;
      bought++;
    }
    expect(bought).toBe(9); // wrong — the budget affords ten
  });

  it('counts exactly ten purchases in integer micro-dollars', () => {
    const unitMicro = Math.round(unit * 1e6);
    const budgetMicro = Math.round(budget * 1e6);
    let spentMicro = 0;
    let bought = 0;
    for (let i = 0; i < 20; i++) {
      if (spentMicro + unitMicro > budgetMicro) break;
      spentMicro += unitMicro;
      bought++;
    }
    expect(bought).toBe(10);
    expect(spentMicro / 1e6).toBe(budget);
  });
});
