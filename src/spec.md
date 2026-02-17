# Specification

## Summary
**Goal:** Add checkout payment method selection (UPI, Card via Stripe, and Cash on Delivery) and store/display the chosen method on orders.

**Planned changes:**
- Update the Checkout UI to present selectable payment options with clear labels: UPI, Card, Cash on Delivery (COD).
- Persist the selected payment method in the order record when an order is placed.
- Implement Card payment behavior to create a Stripe Checkout session and redirect the user to the returned Stripe session URL.
- Implement UPI and COD behaviors to place the order without redirect and show an on-screen confirmation message appropriate to the selected method.
- Update the Orders page to display the saved payment method label for each order.

**User-visible outcome:** Shoppers can choose UPI, Card, or Cash on Delivery at checkout; Card redirects to Stripe to pay, while UPI/COD place the order immediately with a confirmation message, and the chosen payment method appears on the Orders page.
