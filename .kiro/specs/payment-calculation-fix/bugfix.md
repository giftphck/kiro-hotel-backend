# Bugfix Requirements Document

## Introduction

The `totalPaidFromHistory` calculation in the hotel management system is incorrectly computing the total paid amount from payment history. The current implementation performs a simple sum of all payment amounts without properly handling different payment types, particularly refunds which should reduce the total. This affects both the frontend (Angular) and backend (Node.js/Express) implementations, leading to inaccurate payment totals displayed to users and potentially incorrect booking status calculations.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a booking has payment history containing REFUND payment types with negative amounts THEN the system incorrectly adds the negative amount as a positive value to the total

1.2 WHEN a booking has payment history containing unconfirmed or failed payments THEN the system incorrectly includes these invalid payments in the total paid calculation

1.3 WHEN calculating totalPaidFromHistory in both frontend and backend THEN the system uses a simple sum without filtering by payment status or properly handling payment types

### Expected Behavior (Correct)

2.1 WHEN a booking has payment history containing REFUND payment types with negative amounts THEN the system SHALL correctly subtract the refund amount from the total paid (treating negative amounts as reductions)

2.2 WHEN a booking has payment history containing unconfirmed or failed payments THEN the system SHALL exclude these invalid payments from the total paid calculation

2.3 WHEN calculating totalPaidFromHistory in both frontend and backend THEN the system SHALL sum only confirmed/successful payments and correctly handle all payment types (DEPOSIT, PARTIAL, FULL, INITIAL_PAYMENT, REFUND)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a booking has payment history containing only DEPOSIT payment types THEN the system SHALL CONTINUE TO correctly sum these deposit amounts

3.2 WHEN a booking has payment history containing only PARTIAL payment types THEN the system SHALL CONTINUE TO correctly sum these partial payment amounts

3.3 WHEN a booking has payment history containing only FULL payment types THEN the system SHALL CONTINUE TO correctly sum these full payment amounts

3.4 WHEN a booking has payment history containing a mix of DEPOSIT, PARTIAL, and FULL payment types (without refunds) THEN the system SHALL CONTINUE TO correctly sum all these payment amounts

3.5 WHEN a booking has no payment history THEN the system SHALL CONTINUE TO return zero as the total paid amount

3.6 WHEN displaying payment information in the room board component THEN the system SHALL CONTINUE TO show payment details in the same UI format and location
