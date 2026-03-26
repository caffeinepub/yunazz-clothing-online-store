# Yunazz Clothing Online Store

## Current State
The backend has no stable variables. All data (products, orders, customers, UPI ID, access control) is stored in-memory only and is wiped on every canister upgrade/rebuild. Customers visit the live site and see no products because data was lost on the last deployment.

## Requested Changes (Diff)

### Add
- Stable variables for all persistent state: products, orders, customers, carts, UPI ID, access control roles
- `system func preupgrade()` to serialize maps to stable arrays before upgrade
- `system func postupgrade()` to restore maps from stable arrays after upgrade

### Modify
- Runtime map initialization: load from stable vars instead of starting empty
- AccessControlState initialization: load adminAssigned and userRoles from stable vars

### Remove
- Nothing removed from functionality

## Implementation Plan
1. Add stable var declarations for all data structures
2. Change runtime map/state initialization to populate from stable vars
3. Add preupgrade hook to save all state to stable vars
4. Add postupgrade hook to clear stable vars after restore (optional cleanup)
