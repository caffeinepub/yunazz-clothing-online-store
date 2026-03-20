# Yunazz Clothing Online Store

## Current State
Full e-commerce store with admin dashboard, product management, orders, COD/UPI/card payment, and contact info. Admin dashboard exists but has no flow to initialize the admin role after deployment/redeployment. When the canister restarts, the access control state may reset, leaving no admin, causing product add/edit operations to fail with an empty or unclear error.

## Requested Changes (Diff)

### Add
- "Initialize as Admin" button on the admin page when the current user does not have admin role
- `useInitializeAccessControl` query hook
- Better error message extraction from ICP backend errors

### Modify
- AdminDashboard: show an "Activate Admin" card instead of the generic access denied alert when user is not admin, with a button to claim first-admin role
- ProductFormDialog: improve error message extraction for ICP trap errors

### Remove
- Nothing removed

## Implementation Plan
1. Add `useInitializeAccessControl` mutation hook in useQueries.ts
2. Update AdminDashboard to show an "Activate Admin" call-to-action when userRole !== 'admin'
3. Improve error handling in ProductFormDialog to surface the actual backend error message
