# Payment Calculation Bugfix Design

## Overview

The payment calculation bug stems from three fundamental issues: (1) the absence of a payment status field to filter out failed/pending payments, (2) incorrect handling of refund amounts in the calculation logic, and (3) incomplete payment history display in the UI showing only deposit payments instead of all successful payments. The current implementation performs a naive sum of all payment amounts without considering payment status or properly subtracting refunds, and the UI only displays the initial deposit rather than the complete payment history. This fix will add a status field to the payment_history table, update both frontend and backend calculation logic to correctly compute `effectivePaid = SUM(SUCCESS payments where type != REFUND) - SUM(SUCCESS REFUND payments)`, and enhance the UI to display all SUCCESS payments including DEPOSIT, PAYMENT, and REFUND transactions.

## Glossary

- **Bug_Condition (C)**: The condition that triggers incorrect payment totals - when payment history contains REFUND types or non-SUCCESS status payments
- **Property (P)**: The desired behavior - totalPaidFromHistory correctly calculates effective paid amount by summing SUCCESS payments and subtracting SUCCESS refunds
- **Preservation**: Existing calculation behavior for bookings with only SUCCESS non-REFUND payments must remain unchanged
- **totalPaidFromHistory**: The computed property/function that calculates total paid from payment history
- **PaymentStatus**: New enum field (SUCCESS, FAILED, PENDING) to track payment transaction status
- **effectivePaid**: The actual amount paid after accounting for refunds: `SUM(SUCCESS non-REFUND) - SUM(SUCCESS REFUND)`
- **updateBookingDeposit**: Backend service method in `booking.service.ts` that processes payments and updates booking deposit
- **remainingDeposit**: The deposit amount that has not been refunded yet: `SUM(DEPOSIT SUCCESS) - SUM(REFUND SUCCESS)`
- **remainingBalance**: The amount still owed on the booking: `calculatedRoomPrice - effectivePaid`

## Bug Details

### Bug Condition

The bug manifests in three scenarios: (1) when payment history contains REFUND payment types or non-SUCCESS status payments, the calculation logic performs incorrect sums, (2) the UI only displays deposit payments instead of all successful payment transactions, and (3) users cannot see the complete payment history including partial payments and refunds. The calculation logic in both frontend (`totalPaidFromHistory` computed signal) and backend (`updateBookingDeposit` method) performs a simple sum without filtering by status or properly handling refund subtraction. Additionally, the UI payment history display is incomplete.

**Formal Specification:**
```
FUNCTION isBugCondition(paymentHistory, uiDisplayedPayments)
  INPUT: paymentHistory of type PaymentHistory[]
         uiDisplayedPayments of type PaymentHistory[] (what UI shows)
  OUTPUT: boolean
  
  RETURN (EXISTS payment IN paymentHistory WHERE payment.paymentType == 'REFUND')
         OR (EXISTS payment IN paymentHistory WHERE payment.status != 'SUCCESS')
         OR (paymentHistory.length == 0)
         OR (uiDisplayedPayments.length < paymentHistory.filter(p => p.status == 'SUCCESS').length)
         OR (EXISTS payment IN paymentHistory WHERE payment.paymentType != 'DEPOSIT' AND payment NOT IN uiDisplayedPayments)
END FUNCTION
```

### Examples

- **Example 1 - Refund Not Subtracted**: 
  - Payment history: [DEPOSIT: 1000 baht SUCCESS, REFUND: 500 baht SUCCESS]
  - Current behavior: totalPaid = 1000 + 500 = 1500 baht (WRONG - adds refund as positive)
  - Expected behavior: effectivePaid = 1000 - 500 = 500 baht

- **Example 2 - Failed Payment Included**:
  - Payment history: [DEPOSIT: 1000 baht SUCCESS, PARTIAL: 500 baht FAILED]
  - Current behavior: totalPaid = 1000 + 500 = 1500 baht (WRONG - includes failed payment)
  - Expected behavior: effectivePaid = 1000 baht (excludes failed payment)

- **Example 3 - Mixed Valid Payments**:
  - Payment history: [DEPOSIT: 1000 baht SUCCESS, PARTIAL: 500 baht SUCCESS, PARTIAL: 300 baht SUCCESS]
  - Current behavior: totalPaid = 1800 baht (CORRECT)
  - Expected behavior: effectivePaid = 1800 baht (should remain unchanged)

- **Example 4 - UI Display Bug**:
  - Payment history in DB: [DEPOSIT: 100 baht SUCCESS, PAYMENT: 100 baht SUCCESS]
  - Current UI behavior: Only shows DEPOSIT: 100 baht (WRONG - missing PAYMENT transaction)
  - Expected UI behavior: Shows both transactions - DEPOSIT: 100 baht and PAYMENT: 100 baht

- **Edge Case - Empty History**:
  - Payment history: []
  - Expected behavior: effectivePaid = 0 baht, UI shows "No payments yet"

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Bookings with only SUCCESS payments of type DEPOSIT, PARTIAL, FULL, or INITIAL_PAYMENT must continue to calculate the same total
- Empty payment history must continue to return 0 as total paid
- Payment validation rules (minimum 1 baht, refund cannot exceed total paid) must continue to work
- Booking status determination logic (PARTIAL vs FULL) must continue to work correctly

**Scope:**
All inputs that do NOT involve REFUND payment types or non-SUCCESS status payments should be completely unaffected by this fix. This includes:
- Bookings with only successful deposits
- Bookings with only successful partial payments
- Bookings with only successful full payments
- Bookings with mixed successful non-refund payments
- Bookings with no payment history

**UI Display Enhancement (Not Preservation):**
The UI payment history display will be ENHANCED to show all SUCCESS payments, not just deposits. This is a bug fix, not a preservation requirement.

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Missing Payment Status Field**: The `payment_history` table lacks a status field to distinguish between SUCCESS, FAILED, and PENDING payments. All payments are currently treated as successful.

2. **Naive Sum Implementation**: Both frontend and backend use `reduce((sum, payment) => sum + Number(payment.amount), 0)` which blindly sums all amounts without:
   - Filtering by payment status
   - Checking payment type to handle refunds differently
   - Subtracting refund amounts

3. **Schema Constraint Conflict**: The database has `CHECK (amount > 0)` constraint, but the backend code attempts to store refunds as negative amounts (`paymentAmountNum` can be negative), creating a conflict.

4. **Inconsistent Refund Handling**: The backend stores refunds with `paymentType: PaymentType.REFUND` but the calculation logic doesn't use this information to subtract the amount.

5. **Incomplete UI Payment History Display**: The UI component only displays deposit payments instead of fetching and showing all SUCCESS payment transactions. This prevents users from seeing the complete payment history including partial payments (PAYMENT type) and refunds.

6. **Missing Business Rule Validations**: The system lacks proper validation for:
   - Refund button visibility (should hide when no remaining deposit to refund)
   - Additional payment limit (should prevent payments exceeding calculated room price)
   - Proper calculation of remaining deposit and remaining balance

## Correctness Properties

Property 1: Bug Condition - Correct Effective Paid Calculation and Complete Payment History Display

_For any_ payment history containing REFUND payment types or non-SUCCESS status payments, the fixed totalPaidFromHistory function SHALL calculate effectivePaid as the sum of all SUCCESS payments (excluding REFUND type) minus the sum of all SUCCESS REFUND payments, ensuring refunds properly reduce the total and failed/pending payments are excluded. Additionally, the UI SHALL display all SUCCESS payment transactions including DEPOSIT, PAYMENT, and REFUND types, not just deposit payments.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Refund Success Payment Calculation

_For any_ payment history containing only SUCCESS status payments with types DEPOSIT, PARTIAL, FULL, or INITIAL_PAYMENT (no REFUND types), the fixed totalPaidFromHistory function SHALL produce exactly the same result as the original function, preserving the simple sum behavior for standard successful payments.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

#### 1. Database Schema Migration

**File**: `database/migrations/00X_add_payment_status.sql` (new file)

**Changes**:
- Add `status` column to `payment_history` table with enum type ('SUCCESS', 'FAILED', 'PENDING')
- Set default value to 'SUCCESS' for backward compatibility
- Update existing records to have status = 'SUCCESS'
- Add index on status column for query performance

**SQL**:
```sql
ALTER TABLE payment_history 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS';

CREATE INDEX idx_payment_history_status ON payment_history(status);

COMMENT ON COLUMN payment_history.status IS 'Payment transaction status: SUCCESS, FAILED, PENDING';
```

#### 2. Backend Model Updates

**File**: `backend/src/models/payment-history.model.ts`

**Changes**:
- Add `PaymentStatus` enum with values: SUCCESS, FAILED, PENDING
- Add `status` field to `PaymentHistory` interface
- Add `status` field to `CreatePaymentHistoryDto` interface with default value

#### 3. Backend Service - Payment Calculation Logic

**File**: `backend/src/services/booking.service.ts`

**Function**: `updateBookingDeposit`

**Specific Changes**:
1. **Replace naive sum calculation**:
   ```typescript
   // OLD (line ~186):
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

2. **Update refund storage logic**: Refunds should be stored as positive amounts (already correct in current code with `Math.abs(paymentAmountNum)`)

3. **Add status field to payment history creation**:
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

4. **Fix refund amount storage**: Change from negative to positive (use `absoluteAmount` instead of `paymentAmountNum`)

#### 4. Frontend Model Updates

**File**: `frontend/src/app/models/payment-history.model.ts`

**Changes**:
- Add `PaymentStatus` enum with values: SUCCESS, FAILED, PENDING
- Add `status` field to `PaymentHistory` interface

#### 5. Frontend Component - Computed Signal

**File**: `frontend/src/app/pages/room-board/room-board.component.ts`

**Property**: `totalPaidFromHistory` (line ~129)

**Specific Changes**:
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

#### 6. Backend Repository Updates

**File**: `backend/src/repositories/payment-history.repository.ts`

**Changes**:
- Update `create` method to accept `status` field
- Ensure `status` is included in INSERT statements
- Update `findByBookingId` to return status field in SELECT queries

#### 7. Frontend UI - Payment History Display Enhancement

**File**: `frontend/src/app/pages/room-board/room-board.component.html` (or relevant template file)

**Current Issue**: UI only displays deposit payment, missing other payment types (PAYMENT, REFUND)

**Changes Required**:
1. **Update payment history display section** to show all SUCCESS payments:
   - Display payment type label (DEPOSIT, PAYMENT, REFUND)
   - Display amount with proper formatting
   - Display date/time of payment
   - Display payment method if available
   - Display remark/notes if available

2. **Add visual distinction for refunds**:
   - Show refunds with negative sign or different color (e.g., red text)
   - Use icon or badge to indicate refund type

3. **Ensure data binding** uses the complete `paymentHistory()` signal filtered by SUCCESS status:
   ```typescript
   // In component:
   displayedPayments = computed(() => {
     return this.paymentHistory()
       .filter(payment => payment.status === 'SUCCESS')
       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   });
   ```

4. **Template structure** (example):
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

5. **Add helper method** for payment type labels:
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

#### 8. Business Rule Validations

**File**: `frontend/src/app/pages/room-board/room-board.component.ts`

**Business Rule 1: Refund Button Visibility**

Add computed signal to determine if refund button should be shown:
```typescript
// Calculate remaining deposit (deposit paid minus refunds)
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

// Show refund button only if there's remaining deposit
canRefund = computed(() => this.remainingDeposit() > 0);
```

Template update:
```html
@if (canRefund()) {
  <button (click)="openRefundModal(booking)">Refund Deposit</button>
}
```

**Business Rule 2: Additional Payment Limit**

Add computed signal and validation:
```typescript
// Calculate remaining balance (room price minus effective paid)
remainingBalance = computed(() => {
  const booking = this.selectedBooking();
  if (!booking) return 0;
  const totalPrice = Number(booking.totalPrice);
  const paid = this.totalPaidFromHistory();
  return Math.max(0, totalPrice - paid);
});

// Maximum additional payment allowed
maxAdditionalPayment = computed(() => this.remainingBalance());
```

Update payment validation in `submitAddPayment()`:
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

**File**: `backend/src/services/booking.service.ts`

**Backend Validation for Payment Limit**

Update `updateBookingDeposit` method to add validation:
```typescript
// After calculating totalPaid and before determining payment type
const calculatedPrice = Number(currentBooking.totalPrice);
const newTotalPaid = totalPaid + paymentAmountNum;

// NEW: Validate payment doesn't exceed calculated price (only for non-refunds)
if (!isRefund && newTotalPaid > calculatedPrice) {
  throw new Error(
    `Payment amount would exceed calculated room price. ` +
    `Maximum additional payment: ${calculatedPrice - totalPaid} baht`
  );
}
```

**Backend Validation for Refund Limit**

Update refund validation to check against remaining deposit:
```typescript
if (isRefund) {
  // Calculate remaining deposit
  const depositPaid = paymentHistory
    .filter(p => p.status === 'SUCCESS' && p.paymentType === PaymentType.DEPOSIT)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const alreadyRefunded = paymentHistory
    .filter(p => p.status === 'SUCCESS' && p.paymentType === PaymentType.REFUND)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingDeposit = depositPaid - alreadyRefunded;
  
  // Validate refund amount
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

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Create test bookings with various payment histories and observe the calculated totalPaid on UNFIXED code. Document the incorrect calculations to validate our understanding of the bug.

**Test Cases**:
1. **Refund Not Subtracted Test**: Create booking with 1000 baht deposit + 500 baht refund (will show 1500 instead of 500 on unfixed code)
2. **Failed Payment Included Test**: Create booking with 1000 baht SUCCESS + 500 baht FAILED (will show 1500 instead of 1000 on unfixed code - after adding status field)
3. **Multiple Refunds Test**: Create booking with 2000 baht deposit + 300 baht refund + 200 baht refund (will show 2500 instead of 1500 on unfixed code)
4. **Empty History Test**: Create booking with no payments (should show 0, verify this works)
5. **UI Display Test**: Create booking with 100 baht DEPOSIT + 100 baht PAYMENT (UI will only show deposit on unfixed code, should show both)
6. **Refund Button Visibility Test**: Create booking with 100 baht deposit fully refunded (refund button should be hidden on fixed code, may be visible on unfixed code)
7. **Payment Limit Test**: Attempt to add payment exceeding room price (should be rejected on fixed code, may be accepted on unfixed code)

**Expected Counterexamples**:
- Refunds are added to total instead of subtracted
- Failed/pending payments are included in total (after status field is added)
- Calculation produces incorrect totals for any payment history with refunds
- UI only shows deposit payments, missing PAYMENT and REFUND transactions

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL paymentHistory WHERE isBugCondition(paymentHistory) DO
  result := totalPaidFromHistory_fixed(paymentHistory)
  ASSERT result == calculateExpectedEffectivePaid(paymentHistory)
END FOR

FUNCTION calculateExpectedEffectivePaid(paymentHistory)
  successPayments := FILTER paymentHistory WHERE status == 'SUCCESS'
  nonRefundSum := SUM(successPayments WHERE paymentType != 'REFUND')
  refundSum := SUM(successPayments WHERE paymentType == 'REFUND')
  RETURN nonRefundSum - refundSum
END FUNCTION
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL paymentHistory WHERE NOT isBugCondition(paymentHistory) DO
  ASSERT totalPaidFromHistory_original(paymentHistory) == totalPaidFromHistory_fixed(paymentHistory)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Create test bookings with only SUCCESS non-REFUND payments on UNFIXED code, record the calculated totals, then verify the FIXED code produces identical results.

**Test Cases**:
1. **Single Deposit Preservation**: Booking with 1000 baht DEPOSIT SUCCESS (should remain 1000)
2. **Multiple Partials Preservation**: Booking with 500 + 300 + 200 baht PARTIAL SUCCESS (should remain 1000)
3. **Mixed Types Preservation**: Booking with 500 DEPOSIT + 300 PARTIAL + 200 PARTIAL SUCCESS (should remain 1000)
4. **Empty History Preservation**: Booking with no payments (should remain 0)
5. **UI Display Enhancement Verification**: Booking with multiple payments should now show all transactions (this is an enhancement, not preservation)

### Unit Tests

**Backend Tests** (`booking.service.test.ts`):
- Test `updateBookingDeposit` correctly calculates totalPaid with refunds
- Test refunds are stored as positive amounts with REFUND type
- Test failed payments are excluded from totalPaid calculation
- Test validation: refund cannot exceed remaining deposit (not total paid)
- Test validation: payment cannot exceed calculated room price
- Test edge case: multiple refunds reduce total correctly
- Test edge case: empty payment history returns 0
- Test edge case: attempting refund when no deposit remains throws error
- Test edge case: attempting payment that would exceed room price throws error

**Frontend Tests** (`room-board.component.spec.ts`):
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

### Property-Based Tests

**Backend PBT** (`booking.service.pbt.test.ts`):
- Generate random payment histories with various combinations of payment types and statuses
- Property 1: For any payment history with refunds, effectivePaid = SUM(SUCCESS non-REFUND) - SUM(SUCCESS REFUND)
- Property 2: For any payment history with only SUCCESS non-REFUND payments, fixed calculation equals original calculation
- Property 3: effectivePaid is always >= 0 (refunds cannot make total negative due to validation)

**Frontend PBT** (`room-board.component.pbt.spec.ts`):
- Generate random payment histories with various combinations
- Property 1: totalPaidFromHistory with refunds matches expected calculation
- Property 2: totalPaidFromHistory with only SUCCESS non-REFUND payments matches original behavior
- Property 3: totalPaidFromHistory is always a valid number >= 0

### Integration Tests

**End-to-End Tests**:
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
