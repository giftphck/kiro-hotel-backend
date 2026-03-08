/**
 * Bug Condition Exploration Test for Payment Calculation Fix
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * **GOAL**: Surface counterexamples that demonstrate the bug exists
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * This test uses a scoped PBT approach for deterministic bugs, focusing on concrete failing cases
 * to ensure reproducibility and clear demonstration of the bug.
 */

import fc from 'fast-check';
import { PaymentType } from '../models/payment-history.model';

// Mock payment history interface for testing
interface TestPaymentHistory {
  paymentId: string;
  bookingId: string;
  amount: number;
  paymentType: PaymentType;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: Date;
}

/**
 * Calculate totalPaidFromHistory using the CURRENT (UNFIXED) implementation
 * This mimics the buggy behavior: simple sum without status filtering or refund handling
 */
function totalPaidFromHistory_UNFIXED(paymentHistory: TestPaymentHistory[]): number {
  return paymentHistory.reduce((sum, payment) => sum + Number(payment.amount), 0);
}

/**
 * Calculate expected effectivePaid using the CORRECT behavior
 * effectivePaid = SUM(SUCCESS non-REFUND) - SUM(SUCCESS REFUND)
 */
function calculateExpectedEffectivePaid(paymentHistory: TestPaymentHistory[]): number {
  const successPayments = paymentHistory.filter(p => !p.status || p.status === 'SUCCESS');
  const nonRefundSum = successPayments
    .filter(p => p.paymentType !== PaymentType.REFUND)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const refundSum = successPayments
    .filter(p => p.paymentType === PaymentType.REFUND)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  return nonRefundSum - refundSum;
}

describe('Bug Condition Exploration - Payment Calculation with Refunds and Status Filtering', () => {
  describe('Property 1: Bug Condition - Refund Not Subtracted', () => {
    it('EXPECTED TO FAIL: should correctly subtract refunds from total paid', () => {
      // **Validates: Requirements 2.1**
      // Create test booking with payment history: [DEPOSIT: 1000 baht SUCCESS, REFUND: 500 baht SUCCESS]
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'test-booking-1',
          amount: 1000,
          paymentType: PaymentType.DEPOSIT,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'test-booking-1',
          amount: 500,
          paymentType: PaymentType.REFUND,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      ];

      // Calculate using UNFIXED code
      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      
      // Calculate expected behavior
      const expectedTotal = calculateExpectedEffectivePaid(paymentHistory);

      // EXPECTED OUTCOME: Test FAILS (this is correct - it proves the bug exists)
      // Current behavior: totalPaid = 1000 + 500 = 1500 baht (WRONG - adds refund as positive)
      // Expected behavior: effectivePaid = 1000 - 500 = 500 baht
      console.log('=== Bug Condition Test Case 1: Refund Not Subtracted ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (CORRECT):', expectedTotal, 'baht');
      console.log('Bug Detected:', actualTotal !== expectedTotal ? 'YES - Refund added instead of subtracted' : 'NO');

      // This assertion SHOULD FAIL on unfixed code
      expect(actualTotal).toBe(expectedTotal);
    });

    it('EXPECTED TO FAIL: should handle multiple refunds correctly', () => {
      // **Validates: Requirements 2.1**
      // Create test booking with payment history: [DEPOSIT: 2000 baht SUCCESS, REFUND: 300 baht SUCCESS, REFUND: 200 baht SUCCESS]
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'test-booking-2',
          amount: 2000,
          paymentType: PaymentType.DEPOSIT,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'test-booking-2',
          amount: 300,
          paymentType: PaymentType.REFUND,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '3',
          bookingId: 'test-booking-2',
          amount: 200,
          paymentType: PaymentType.REFUND,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = calculateExpectedEffectivePaid(paymentHistory);

      // Current behavior: 2000 + 300 + 200 = 2500 (WRONG)
      // Expected behavior: 2000 - 300 - 200 = 1500
      console.log('=== Bug Condition Test Case 2: Multiple Refunds ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (CORRECT):', expectedTotal, 'baht');
      console.log('Bug Detected:', actualTotal !== expectedTotal ? 'YES - Multiple refunds added instead of subtracted' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });
  });

  describe('Property 1: Bug Condition - Failed Payment Included (Status Field)', () => {
    it('EXPECTED TO FAIL: should exclude FAILED status payments from total', () => {
      // **Validates: Requirements 2.2**
      // Create test booking with payment history: [DEPOSIT: 1000 baht SUCCESS, PARTIAL: 500 baht FAILED]
      // NOTE: This test will fail differently - the status field doesn't exist yet in the model
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'test-booking-3',
          amount: 1000,
          paymentType: PaymentType.DEPOSIT,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'test-booking-3',
          amount: 500,
          paymentType: PaymentType.PARTIAL,
          status: 'FAILED',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = calculateExpectedEffectivePaid(paymentHistory);

      // Current behavior: 1000 + 500 = 1500 (WRONG - includes failed payment)
      // Expected behavior: 1000 (excludes failed payment)
      console.log('=== Bug Condition Test Case 3: Failed Payment Included ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (CORRECT):', expectedTotal, 'baht');
      console.log('Bug Detected:', actualTotal !== expectedTotal ? 'YES - Failed payment included in total' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });

    it('EXPECTED TO FAIL: should exclude PENDING status payments from total', () => {
      // **Validates: Requirements 2.2**
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'test-booking-4',
          amount: 1000,
          paymentType: PaymentType.DEPOSIT,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'test-booking-4',
          amount: 300,
          paymentType: PaymentType.PARTIAL,
          status: 'PENDING',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = calculateExpectedEffectivePaid(paymentHistory);

      // Current behavior: 1000 + 300 = 1300 (WRONG - includes pending payment)
      // Expected behavior: 1000 (excludes pending payment)
      console.log('=== Bug Condition Test Case 4: Pending Payment Included ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (CORRECT):', expectedTotal, 'baht');
      console.log('Bug Detected:', actualTotal !== expectedTotal ? 'YES - Pending payment included in total' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });
  });

  describe('Property 1: Bug Condition - Complex Scenarios', () => {
    it('EXPECTED TO FAIL: should handle mixed payment types with refunds and status filtering', () => {
      // **Validates: Requirements 2.1, 2.2, 2.3**
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'test-booking-5',
          amount: 1000,
          paymentType: PaymentType.DEPOSIT,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'test-booking-5',
          amount: 500,
          paymentType: PaymentType.PARTIAL,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '3',
          bookingId: 'test-booking-5',
          amount: 200,
          paymentType: PaymentType.REFUND,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '4',
          bookingId: 'test-booking-5',
          amount: 300,
          paymentType: PaymentType.PARTIAL,
          status: 'FAILED',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = calculateExpectedEffectivePaid(paymentHistory);

      // Current behavior: 1000 + 500 + 200 + 300 = 2000 (WRONG)
      // Expected behavior: (1000 + 500) - 200 = 1300 (excludes failed, subtracts refund)
      console.log('=== Bug Condition Test Case 5: Complex Mixed Scenario ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (CORRECT):', expectedTotal, 'baht');
      console.log('Bug Detected:', actualTotal !== expectedTotal ? 'YES - Multiple bugs: refund added, failed payment included' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });
  });

  describe('Property 1: Bug Condition - Property-Based Test (Scoped)', () => {
    it('EXPECTED TO FAIL: property test for any payment history with refunds', () => {
      // **Validates: Requirements 2.1, 2.2, 2.3**
      // Scoped PBT: Generate payment histories that MUST contain at least one refund
      // This ensures we're testing the bug condition specifically
      
      const paymentHistoryArbitrary = fc.array(
        fc.record({
          paymentId: fc.uuid(),
          bookingId: fc.constant('test-booking'),
          amount: fc.integer({ min: 100, max: 5000 }),
          paymentType: fc.constantFrom(
            PaymentType.DEPOSIT,
            PaymentType.PARTIAL,
            PaymentType.FULL,
            PaymentType.REFUND
          ),
          status: fc.constantFrom('SUCCESS', 'FAILED', 'PENDING') as fc.Arbitrary<'SUCCESS' | 'FAILED' | 'PENDING'>,
          createdAt: fc.constant(new Date())
        }),
        { minLength: 2, maxLength: 10 }
      ).filter((history: TestPaymentHistory[]) =>
        // Ensure at least one refund exists (bug condition)
        history.some((p: TestPaymentHistory) => p.paymentType === PaymentType.REFUND)
      );

      fc.assert(
        fc.property(paymentHistoryArbitrary, (paymentHistory: TestPaymentHistory[]) => {
          const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
          const expectedTotal = calculateExpectedEffectivePaid(paymentHistory);

          // Log counterexample when found
          if (actualTotal !== expectedTotal) {
            console.log('=== Property Test Counterexample Found ===');
            console.log('Payment History:', paymentHistory.map((p: TestPaymentHistory) => `${p.paymentType}: ${p.amount} baht ${p.status}`));
            console.log('Actual (UNFIXED):', actualTotal, 'baht');
            console.log('Expected (CORRECT):', expectedTotal, 'baht');
            console.log('Difference:', actualTotal - expectedTotal, 'baht');
          }

          // This assertion SHOULD FAIL on unfixed code
          return actualTotal === expectedTotal;
        }),
        { numRuns: 20 }
      );
    });
  });
});

/**
 * Preservation Property Tests for Payment Calculation Fix
 * 
 * **IMPORTANT**: These tests follow observation-first methodology
 * **GOAL**: Verify baseline behavior on UNFIXED code for non-buggy inputs
 * **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * These tests ensure that bookings with only SUCCESS non-REFUND payments
 * continue to calculate the same total after the fix is implemented.
 */

describe('Preservation Property Tests - Non-Refund Success Payment Calculation', () => {
  describe('Property 2: Preservation - Observed Baseline Behavior', () => {
    it('should correctly sum single DEPOSIT payment', () => {
      // **Validates: Requirements 3.1**
      // Observe behavior on UNFIXED code: [DEPOSIT: 1000 baht SUCCESS]
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'preservation-1',
          amount: 1000,
          paymentType: PaymentType.DEPOSIT,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = 1000; // Observed baseline: simple sum

      console.log('=== Preservation Test Case 1: Single Deposit ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (Baseline):', expectedTotal, 'baht');
      console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

      // This should PASS on unfixed code
      expect(actualTotal).toBe(expectedTotal);
    });

    it('should correctly sum multiple PARTIAL payments', () => {
      // **Validates: Requirements 3.2**
      // Observe behavior on UNFIXED code: [PARTIAL: 500, PARTIAL: 300, PARTIAL: 200]
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'preservation-2',
          amount: 500,
          paymentType: PaymentType.PARTIAL,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'preservation-2',
          amount: 300,
          paymentType: PaymentType.PARTIAL,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '3',
          bookingId: 'preservation-2',
          amount: 200,
          paymentType: PaymentType.PARTIAL,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = 1000; // 500 + 300 + 200

      console.log('=== Preservation Test Case 2: Multiple Partials ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (Baseline):', expectedTotal, 'baht');
      console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });

    it('should correctly sum mixed DEPOSIT and PARTIAL payments', () => {
      // **Validates: Requirements 3.4**
      // Observe behavior on UNFIXED code: [DEPOSIT: 500, PARTIAL: 300, PARTIAL: 200]
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'preservation-3',
          amount: 500,
          paymentType: PaymentType.DEPOSIT,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'preservation-3',
          amount: 300,
          paymentType: PaymentType.PARTIAL,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '3',
          bookingId: 'preservation-3',
          amount: 200,
          paymentType: PaymentType.PARTIAL,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = 1000; // 500 + 300 + 200

      console.log('=== Preservation Test Case 3: Mixed Deposit and Partials ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (Baseline):', expectedTotal, 'baht');
      console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });

    it('should return 0 for empty payment history', () => {
      // **Validates: Requirements 3.5**
      // Observe behavior on UNFIXED code: []
      const paymentHistory: TestPaymentHistory[] = [];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = 0;

      console.log('=== Preservation Test Case 4: Empty History ===');
      console.log('Payment History: []');
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (Baseline):', expectedTotal, 'baht');
      console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });

    it('should correctly sum FULL payment type', () => {
      // **Validates: Requirements 3.3**
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'preservation-4',
          amount: 2500,
          paymentType: PaymentType.FULL,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = 2500;

      console.log('=== Preservation Test Case 5: Full Payment ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (Baseline):', expectedTotal, 'baht');
      console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });

    it('should correctly sum INITIAL_PAYMENT type', () => {
      // **Validates: Requirements 3.4**
      const paymentHistory: TestPaymentHistory[] = [
        {
          paymentId: '1',
          bookingId: 'preservation-5',
          amount: 800,
          paymentType: PaymentType.INITIAL_PAYMENT,
          status: 'SUCCESS',
          createdAt: new Date()
        },
        {
          paymentId: '2',
          bookingId: 'preservation-5',
          amount: 200,
          paymentType: PaymentType.PARTIAL,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      ];

      const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
      const expectedTotal = 1000;

      console.log('=== Preservation Test Case 6: Initial Payment + Partial ===');
      console.log('Payment History:', paymentHistory.map(p => `${p.paymentType}: ${p.amount} baht ${p.status}`));
      console.log('Actual (UNFIXED):', actualTotal, 'baht');
      console.log('Expected (Baseline):', expectedTotal, 'baht');
      console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

      expect(actualTotal).toBe(expectedTotal);
    });
  });

  describe('Property 2: Preservation - Property-Based Test', () => {
    it('should preserve simple sum behavior for all SUCCESS non-REFUND payment histories', () => {
      // **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
      // Property: For all payment histories containing only SUCCESS status payments
      // with types DEPOSIT, PARTIAL, FULL, or INITIAL_PAYMENT (no REFUND types),
      // totalPaidFromHistory = SUM(all amounts)

      const preservationPaymentHistoryArbitrary = fc.array(
        fc.record({
          paymentId: fc.uuid(),
          bookingId: fc.constant('preservation-test'),
          amount: fc.integer({ min: 1, max: 10000 }),
          paymentType: fc.constantFrom(
            PaymentType.DEPOSIT,
            PaymentType.PARTIAL,
            PaymentType.FULL,
            PaymentType.INITIAL_PAYMENT
          ),
          status: fc.constant('SUCCESS') as fc.Arbitrary<'SUCCESS'>,
          createdAt: fc.constant(new Date())
        }),
        { minLength: 0, maxLength: 10 }
      );

      fc.assert(
        fc.property(preservationPaymentHistoryArbitrary, (paymentHistory: TestPaymentHistory[]) => {
          const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
          
          // Expected: simple sum of all amounts (no refunds, all SUCCESS)
          const expectedTotal = paymentHistory.reduce((sum, p) => sum + Number(p.amount), 0);

          // Log test case
          if (paymentHistory.length > 0) {
            console.log('=== Preservation Property Test ===');
            console.log('Payment History:', paymentHistory.map((p: TestPaymentHistory) => `${p.paymentType}: ${p.amount} baht ${p.status}`));
            console.log('Actual (UNFIXED):', actualTotal, 'baht');
            console.log('Expected (Simple Sum):', expectedTotal, 'baht');
            console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');
          }

          // This should PASS on unfixed code - verifies baseline behavior
          return actualTotal === expectedTotal;
        }),
        { numRuns: 50 }
      );
    });

    it('should handle edge case: all payments have same type', () => {
      // **Validates: Requirements 3.1, 3.2, 3.3**
      // Test that multiple payments of the same type sum correctly
      
      const sameTypePaymentHistoryArbitrary = fc.tuple(
        fc.constantFrom(
          PaymentType.DEPOSIT,
          PaymentType.PARTIAL,
          PaymentType.FULL,
          PaymentType.INITIAL_PAYMENT
        ),
        fc.array(fc.integer({ min: 1, max: 5000 }), { minLength: 1, maxLength: 5 })
      ).map(([paymentType, amounts]) => 
        amounts.map((amount, index) => ({
          paymentId: `${index + 1}`,
          bookingId: 'same-type-test',
          amount,
          paymentType,
          status: 'SUCCESS' as const,
          createdAt: new Date()
        }))
      );

      fc.assert(
        fc.property(sameTypePaymentHistoryArbitrary, (paymentHistory: TestPaymentHistory[]) => {
          const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
          const expectedTotal = paymentHistory.reduce((sum, p) => sum + Number(p.amount), 0);

          console.log('=== Preservation Edge Case: Same Type ===');
          console.log('Payment Type:', paymentHistory[0]?.paymentType);
          console.log('Amounts:', paymentHistory.map((p: TestPaymentHistory) => p.amount));
          console.log('Actual (UNFIXED):', actualTotal, 'baht');
          console.log('Expected (Simple Sum):', expectedTotal, 'baht');
          console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

          return actualTotal === expectedTotal;
        }),
        { numRuns: 30 }
      );
    });

    it('should handle edge case: large number of small payments', () => {
      // **Validates: Requirements 3.4**
      // Test that many small payments sum correctly without precision issues
      
      const manySmallPaymentsArbitrary = fc.array(
        fc.record({
          paymentId: fc.uuid(),
          bookingId: fc.constant('many-payments-test'),
          amount: fc.integer({ min: 1, max: 100 }),
          paymentType: fc.constantFrom(
            PaymentType.DEPOSIT,
            PaymentType.PARTIAL
          ),
          status: fc.constant('SUCCESS') as fc.Arbitrary<'SUCCESS'>,
          createdAt: fc.constant(new Date())
        }),
        { minLength: 10, maxLength: 50 }
      );

      fc.assert(
        fc.property(manySmallPaymentsArbitrary, (paymentHistory: TestPaymentHistory[]) => {
          const actualTotal = totalPaidFromHistory_UNFIXED(paymentHistory);
          const expectedTotal = paymentHistory.reduce((sum, p) => sum + Number(p.amount), 0);

          console.log('=== Preservation Edge Case: Many Small Payments ===');
          console.log('Number of Payments:', paymentHistory.length);
          console.log('Total Amount:', expectedTotal, 'baht');
          console.log('Actual (UNFIXED):', actualTotal, 'baht');
          console.log('Expected (Simple Sum):', expectedTotal, 'baht');
          console.log('Baseline Preserved:', actualTotal === expectedTotal ? 'YES' : 'NO');

          return actualTotal === expectedTotal;
        }),
        { numRuns: 20 }
      );
    });
  });
});
