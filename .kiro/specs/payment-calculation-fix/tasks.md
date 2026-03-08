# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Payment Calculation with Refunds and Status Filtering
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test implementation details from Bug Condition in design:
    - Create test booking with payment history: [DEPOSIT: 1000 baht SUCCESS, REFUND: 500 baht SUCCESS]
    - Calculate totalPaidFromHistory on UNFIXED code
    - Create test booking with payment history: [DEPOSIT: 1000 baht SUCCESS, PARTIAL: 500 baht FAILED]
    - Calculate totalPaidFromHistory on UNFIXED code (after status field exists)
    - Create test booking with payment history: [DEPOSIT: 100 baht SUCCESS, PAYMENT: 100 baht SUCCESS]
    - Verify UI only displays deposit payment on UNFIXED code
  - The test assertions should match the Expected Behavior Properties from design:
    - ASSERT effectivePaid = SUM(SUCCESS non-REFUND) - SUM(SUCCESS REFUND)
    - ASSERT UI displays all SUCCESS payment types (DEPOSIT, PAYMENT, REFUND)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - Refund added instead of subtracted (1000 + 500 = 1500 instead of 1000 - 500 = 500)
    - Failed payment included in total (1000 + 500 = 1500 instead of 1000)
    - UI only shows deposit, missing PAYMENT transaction
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Refund Success Payment Calculation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Create booking with payment history: [DEPOSIT: 1000 baht SUCCESS]
    - Observe totalPaid = 1000 baht on unfixed code
    - Create booking with payment history: [PARTIAL: 500 baht SUCCESS, PARTIAL: 300 baht SUCCESS, PARTIAL: 200 baht SUCCESS]
    - Observe totalPaid = 1000 baht on unfixed code
    - Create booking with payment history: [DEPOSIT: 500 baht SUCCESS, PARTIAL: 300 baht SUCCESS, PARTIAL: 200 baht SUCCESS]
    - Observe totalPaid = 1000 baht on unfixed code
    - Create booking with empty payment history: []
    - Observe totalPaid = 0 baht on unfixed code
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Property: For all payment histories containing only SUCCESS status payments with types DEPOSIT, PARTIAL, FULL, or INITIAL_PAYMENT (no REFUND types), totalPaidFromHistory = SUM(all amounts)
    - Property: For empty payment history, totalPaidFromHistory = 0
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix payment calculation bug

  - [x] 3.1 Database migration - Add payment status column
    - Create new migration file: `database/migrations/00X_add_payment_status.sql`
    - Add `status` column to `payment_history` table with enum type ('SUCCESS', 'FAILED', 'PENDING')
    - Set default value to 'SUCCESS' for backward compatibility
    - Update existing records to have status = 'SUCCESS'
    - Add index on status column: `CREATE INDEX idx_payment_history_status ON payment_history(status)`
    - Add column comment: `COMMENT ON COLUMN payment_history.status IS 'Payment transaction status: SUCCESS, FAILED, PENDING'`
    - _Bug_Condition: isBugCondition(paymentHistory) where EXISTS payment WHERE payment.status != 'SUCCESS'_
    - _Expected_Behavior: Database schema supports payment status filtering_
    - _Preservation: Existing payment records default to SUCCESS status_
    - _Requirements: 2.2_

  - [x] 3.2 Backend model updates - Add PaymentStatus enum and status field
    - File: `backend/src/models/payment-history.model.ts`
    - Add `PaymentStatus` enum with values: SUCCESS, FAILED, PENDING
    - Add `status` field to `PaymentHistory` interface with type `PaymentStatus`
    - Add `status` field to `CreatePaymentHistoryDto` interface with default value 'SUCCESS'
    - _Bug_Condition: isBugCondition(paymentHistory) where payment history contains non-SUCCESS status payments_
    - _Expected_Behavior: Model supports payment status field for filtering_
    - _Preservation: Existing code using PaymentHistory interface continues to work_
    - _Requirements: 2.2_

  - [x] 3.3 Backend repository updates - Include status field in queries
    - File: `backend/src/repositories/payment-history.repository.ts`
    - Update `create` method to accept `status` field in parameters
    - Ensure `status` is included in INSERT statements
    - Update `findByBookingId` to return status field in SELECT queries
    - _Bug_Condition: isBugCondition(paymentHistory) where payment history contains non-SUCCESS status payments_
    - _Expected_Behavior: Repository persists and retrieves payment status correctly_
    - _Preservation: Existing repository methods continue to work with default SUCCESS status_
    - _Requirements: 2.2_

  - [x] 3.4 Backend service - Fix payment calculation logic
    - File: `backend/src/services/booking.service.ts`
    - Function: `updateBookingDeposit` (around line 186)
    - Replace naive sum calculation with status-aware refund-handling logic:
      ```typescript
      // OLD:
      const totalPaid = paymentHistory.reduce((sum, payment) => sum + Number(payment.amount), 0);
      
      // NEW:
      const totalPaid = paymentHistory
        .filter(payment => payment.status === 'SUCCESS')
        .reduce((sum, payment) => {
          const amount = Number(payment.amount);
          return payment.paymentType === PaymentType.REFUND 
            ? sum - amount  // Subtract refunds (stored as positive)
            : sum + amount; // Add other payments
        }, 0);
      ```
    - Add status field to payment history creation:
      ```typescript
      await paymentHistoryRepository.create({
        bookingId,
        amount: absoluteAmount, // Always positive
        priceType: currentBooking.priceType,
        paymentType: isRefund ? PaymentType.REFUND : paymentType,
        status: PaymentStatus.SUCCESS, // Add this field
        remark: isRefund ? 'คืนเงินมัดจำ' : (paymentType === PaymentType.FULL ? 'ชำระครบแล้ว' : 'รับเงินเพิ่ม')
      }, client);
      ```
    - _Bug_Condition: isBugCondition(paymentHistory) where EXISTS payment WHERE payment.paymentType == 'REFUND' OR payment.status != 'SUCCESS'_
    - _Expected_Behavior: effectivePaid = SUM(SUCCESS non-REFUND) - SUM(SUCCESS REFUND) from design_
    - _Preservation: Preservation Requirements from design - bookings with only SUCCESS non-REFUND payments calculate same total_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.5 Backend service - Add business rule validations
    - File: `backend/src/services/booking.service.ts`
    - Function: `updateBookingDeposit`
    - Add validation: Payment cannot exceed calculated room price
      ```typescript
      const calculatedPrice = Number(currentBooking.totalPrice);
      const newTotalPaid = totalPaid + paymentAmountNum;
      if (!isRefund && newTotalPaid > calculatedPrice) {
        throw new Error(
          `Payment amount would exceed calculated room price. ` +
          `Maximum additional payment: ${calculatedPrice - totalPaid} baht`
        );
      }
      ```
    - Update refund validation: Refund cannot exceed remaining deposit (not total paid)
      ```typescript
      if (isRefund) {
        const depositPaid = paymentHistory
          .filter(p => p.status === 'SUCCESS' && p.paymentType === PaymentType.DEPOSIT)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const alreadyRefunded = paymentHistory
          .filter(p => p.status === 'SUCCESS' && p.paymentType === PaymentType.REFUND)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const remainingDeposit = depositPaid - alreadyRefunded;
        
        if (absoluteAmount > remainingDeposit) {
          throw new Error(
            `Refund amount cannot exceed remaining deposit of ${remainingDeposit} baht`
          );
        }
        if (absoluteAmount < 1) {
          throw new Error('Refund amount must be at least 1 baht');
        }
      }
      ```
    - _Bug_Condition: Business rules not enforced for payment limits and refund limits_
    - _Expected_Behavior: System validates payment and refund amounts against business rules_
    - _Preservation: Existing valid payments and refunds continue to work_
    - _Requirements: 2.1, 2.2_

  - [x] 3.6 Frontend model updates - Add PaymentStatus enum and status field
    - File: `frontend/src/app/models/payment-history.model.ts`
    - Add `PaymentStatus` enum with values: SUCCESS, FAILED, PENDING
    - Add `status` field to `PaymentHistory` interface with type `PaymentStatus`
    - _Bug_Condition: isBugCondition(paymentHistory) where payment history contains non-SUCCESS status payments_
    - _Expected_Behavior: Frontend model supports payment status field for filtering_
    - _Preservation: Existing code using PaymentHistory interface continues to work_
    - _Requirements: 2.2_

  - [x] 3.7 Frontend component - Fix totalPaidFromHistory computed signal
    - File: `frontend/src/app/pages/room-board/room-board.component.ts`
    - Property: `totalPaidFromHistory` (around line 129)
    - Replace naive sum with status-aware refund-handling logic:
      ```typescript
      // OLD:
      totalPaidFromHistory = computed(() => {
        return this.paymentHistory().reduce((sum, payment) => sum + Number(payment.amount), 0);
      });
      
      // NEW:
      totalPaidFromHistory = computed(() => {
        return this.paymentHistory()
          .filter(payment => payment.status === 'SUCCESS')
          .reduce((sum, payment) => {
            const amount = Number(payment.amount);
            return payment.paymentType === PaymentType.REFUND 
              ? sum - amount  // Subtract refunds (stored as positive)
              : sum + amount; // Add other payments
          }, 0);
      });
      ```
    - _Bug_Condition: isBugCondition(paymentHistory) where EXISTS payment WHERE payment.paymentType == 'REFUND' OR payment.status != 'SUCCESS'_
    - _Expected_Behavior: effectivePaid = SUM(SUCCESS non-REFUND) - SUM(SUCCESS REFUND) from design_
    - _Preservation: Preservation Requirements from design - bookings with only SUCCESS non-REFUND payments calculate same total_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.8 Frontend component - Add business rule computed signals
    - File: `frontend/src/app/pages/room-board/room-board.component.ts`
    - Add `remainingDeposit` computed signal:
      ```typescript
      remainingDeposit = computed(() => {
        const payments = this.paymentHistory().filter(p => p.status === 'SUCCESS');
        const depositPaid = payments
          .filter(p => p.paymentType === PaymentType.DEPOSIT)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const refunded = payments
          .filter(p => p.paymentType === PaymentType.REFUND)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        return depositPaid - refunded;
      });
      ```
    - Add `canRefund` computed signal:
      ```typescript
      canRefund = computed(() => this.remainingDeposit() > 0);
      ```
    - Add `remainingBalance` computed signal:
      ```typescript
      remainingBalance = computed(() => {
        const booking = this.selectedBooking();
        if (!booking) return 0;
        const totalPrice = Number(booking.totalPrice);
        const paid = this.totalPaidFromHistory();
        return Math.max(0, totalPrice - paid);
      });
      ```
    - Add `maxAdditionalPayment` computed signal:
      ```typescript
      maxAdditionalPayment = computed(() => this.remainingBalance());
      ```
    - _Bug_Condition: Business rules not enforced for refund button visibility and payment limits_
    - _Expected_Behavior: UI enforces business rules for refunds and payments_
    - _Preservation: Existing UI behavior for valid operations continues to work_
    - _Requirements: 2.1, 2.2_

  - [x] 3.9 Frontend component - Add payment validation logic
    - File: `frontend/src/app/pages/room-board/room-board.component.ts`
    - Update `submitAddPayment()` method to validate payment amount:
      ```typescript
      submitAddPayment() {
        const amount = this.paymentAmount();
        const booking = this.selectedBooking();
        
        if (!booking) return;
        
        // Validate amount is positive
        if (amount <= 0) {
          this.displayToast('Payment amount must be greater than 0', 'error');
          return;
        }
        
        // NEW: Validate amount doesn't exceed remaining balance
        const maxAllowed = this.maxAdditionalPayment();
        if (amount > maxAllowed) {
          this.displayToast(
            `Payment amount cannot exceed remaining balance of ${maxAllowed} baht`, 
            'error'
          );
          return;
        }
        
        // ... rest of payment logic
      }
      ```
    - _Bug_Condition: Payment validation doesn't check against remaining balance_
    - _Expected_Behavior: System prevents payments exceeding calculated room price_
    - _Preservation: Existing valid payment submissions continue to work_
    - _Requirements: 2.2_

  - [x] 3.10 Frontend UI - Enhance payment history display to show all payment types
    - File: `frontend/src/app/pages/room-board/room-board.component.ts`
    - Add `displayedPayments` computed signal:
      ```typescript
      displayedPayments = computed(() => {
        return this.paymentHistory()
          .filter(payment => payment.status === 'SUCCESS')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      ```
    - Add `getPaymentTypeLabel` helper method:
      ```typescript
      getPaymentTypeLabel(type: PaymentType): string {
        const labels = {
          'DEPOSIT': 'มัดจำ',
          'PAYMENT': 'ชำระเงิน',
          'PARTIAL': 'ชำระบางส่วน',
          'FULL': 'ชำระครบ',
          'INITIAL_PAYMENT': 'ชำระเริ่มต้น',
          'REFUND': 'คืนเงิน'
        };
        return labels[type] || type;
      }
      ```
    - _Bug_Condition: isBugCondition(paymentHistory, uiDisplayedPayments) where uiDisplayedPayments.length < paymentHistory.filter(p => p.status == 'SUCCESS').length_
    - _Expected_Behavior: UI displays all SUCCESS payment types (DEPOSIT, PAYMENT, REFUND)_
    - _Preservation: Existing payment display format and location preserved_
    - _Requirements: 2.3, 3.6_

  - [x] 3.11 Frontend UI - Update payment history template
    - File: `frontend/src/app/pages/room-board/room-board.component.html`
    - Update payment history display section to show all SUCCESS payments:
      ```html
      <div class="payment-history">
        <h4>Payment History</h4>
        @if (displayedPayments().length === 0) {
          <p class="text-muted">No payments yet</p>
        } @else {
          <div class="payment-list">
            @for (payment of displayedPayments(); track payment.paymentId) {
              <div class="payment-item" [class.refund]="payment.paymentType === 'REFUND'">
                <span class="payment-type">{{ getPaymentTypeLabel(payment.paymentType) }}</span>
                <span class="payment-amount" [class.negative]="payment.paymentType === 'REFUND'">
                  {{ payment.paymentType === 'REFUND' ? '-' : '' }}{{ payment.amount | number:'1.2-2' }} ฿
                </span>
                <span class="payment-date">{{ formatDateForDisplay(payment.createdAt) }}</span>
                @if (payment.remark) {
                  <span class="payment-remark">{{ payment.remark }}</span>
                }
              </div>
            }
          </div>
        }
      </div>
      ```
    - Update refund button visibility:
      ```html
      @if (canRefund()) {
        <button (click)="openRefundModal(booking)">Refund Deposit</button>
      }
      ```
    - _Bug_Condition: isBugCondition(paymentHistory, uiDisplayedPayments) where UI only shows deposit payments_
    - _Expected_Behavior: UI displays all SUCCESS payment transactions with proper formatting_
    - _Preservation: Existing UI layout and styling preserved_
    - _Requirements: 2.3, 3.6_

  - [x] 3.12 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Payment Calculation with Refunds and Status Filtering
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify test cases:
      - Booking with 1000 baht deposit + 500 baht refund now calculates 500 baht (not 1500)
      - Booking with 1000 baht SUCCESS + 500 baht FAILED now calculates 1000 baht (not 1500)
      - UI now displays all SUCCESS payment types (DEPOSIT, PAYMENT, REFUND)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.13 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Refund Success Payment Calculation
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix:
      - Single deposit: 1000 baht still calculates 1000 baht
      - Multiple partials: 500 + 300 + 200 still calculates 1000 baht
      - Mixed types: 500 deposit + 300 + 200 partials still calculates 1000 baht
      - Empty history: still returns 0 baht
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Write backend unit tests
  - File: `backend/src/services/booking.service.test.ts`
  - Test `updateBookingDeposit` correctly calculates totalPaid with refunds
  - Test refunds are stored as positive amounts with REFUND type
  - Test failed payments are excluded from totalPaid calculation
  - Test validation: refund cannot exceed remaining deposit
  - Test validation: payment cannot exceed calculated room price
  - Test edge case: multiple refunds reduce total correctly
  - Test edge case: empty payment history returns 0
  - Test edge case: attempting refund when no deposit remains throws error
  - Test edge case: attempting payment that would exceed room price throws error
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Write frontend unit tests
  - File: `frontend/src/app/pages/room-board/room-board.component.spec.ts`
  - Test `totalPaidFromHistory` computed signal with refunds
  - Test `totalPaidFromHistory` excludes FAILED status payments
  - Test `totalPaidFromHistory` excludes PENDING status payments
  - Test preservation: only SUCCESS non-REFUND payments sum correctly
  - Test edge case: empty payment history returns 0
  - Test `displayedPayments` computed signal filters and sorts correctly
  - Test `getPaymentTypeLabel` returns correct Thai labels
  - Test UI displays all SUCCESS payment types (DEPOSIT, PAYMENT, REFUND)
  - Test `remainingDeposit` computed signal calculates correctly
  - Test `canRefund` computed signal returns false when no remaining deposit
  - Test `remainingBalance` computed signal calculates correctly
  - Test `maxAdditionalPayment` computed signal returns correct limit
  - Test payment validation rejects amounts exceeding remaining balance
  - Test refund button visibility based on `canRefund` signal
  - _Requirements: 2.1, 2.2, 2.3, 3.6_

- [x] 6. Write property-based tests
  - Backend PBT file: `backend/src/services/booking.service.pbt.test.ts`
  - Frontend PBT file: `frontend/src/app/pages/room-board/room-board.component.pbt.spec.ts`
  - Generate random payment histories with various combinations of payment types and statuses
  - Property 1: For any payment history with refunds, effectivePaid = SUM(SUCCESS non-REFUND) - SUM(SUCCESS REFUND)
  - Property 2: For any payment history with only SUCCESS non-REFUND payments, fixed calculation equals original calculation
  - Property 3: effectivePaid is always >= 0 (refunds cannot make total negative due to validation)
  - Property 4: totalPaidFromHistory is always a valid number >= 0
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Write end-to-end integration tests
  - Test full payment flow: add deposit → add partial payment → add refund → verify UI shows correct total and all transactions
  - Test payment status flow: create PENDING payment → update to SUCCESS → verify total updates
  - Test refund validation: attempt refund exceeding remaining deposit → verify error message
  - Test payment limit validation: attempt payment exceeding room price → verify error message
  - Test refund button visibility: fully refund deposit → verify refund button is hidden
  - Test UI display: verify payment history section shows all SUCCESS payments with correct amounts, types, and dates
  - Test UI refund display: verify refunds show with negative sign or visual distinction
  - Test booking status: verify booking status (PARTIAL/FULL) updates correctly based on effectivePaid
  - Test empty payment history: verify UI shows "No payments yet" message
  - Test maximum payment scenario: room price 500, paid 200 → verify can only add up to 300 more
  - Test partial refund scenario: deposit 1000, refund 400 → verify can refund up to 600 more, refund button still visible
  - _Requirements: 2.1, 2.2, 2.3, 3.6_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Run all backend unit tests and verify they pass
  - Run all frontend unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Run all end-to-end integration tests and verify they pass
  - Verify bug condition exploration test passes (confirms bug is fixed)
  - Verify preservation tests pass (confirms no regressions)
  - Ask the user if questions arise or if ready to proceed with deployment
