# Security Specification & Test Suite

## 1. Data Invariants
1. **Catalog Integrity**: Only verified administrators registered in `/admins/{uid}` (with `email_verified == true`) can create, edit catalog details, or delete products and raw materials. No personal email addresses or API keys are hardcoded in source files or rules.
2. **Catalog Public Read**: Any guest or authenticated client can read product documents to browse the menu.
3. **Order Privacy**: An authenticated customer can only read or list their own orders where `resource.data.customer.userId == request.auth.uid`. Admins can read, list, and manage all orders.
4. **Order Creation & Update Integrity**: Guests and signed-in customers can place orders, but guests cannot attach a `userId` and signed-in users cannot spoof another user's `userId`. Only verified admins can update order status.
5. **Raw Material Privacy**: Raw material inventory and expiration logs are strictly accessible to verified administrators.
6. **User Profile Privacy**: A user profile `/users/{userId}` can only be read or written by the owner (`request.auth.uid == userId`) or an admin. Users cannot self-escalate `role: 'admin'`.
7. **Admins & One-Time Bootstrap Lock**: The first verified signed-in user may atomically claim admin status only if `/appConfig/bootstrap` does not yet exist (`existsAfter` enforced in a single batch). Once initialized, `/appConfig/bootstrap` is permanently immutable and only existing admins can add or remove records in `/admins/{adminId}`.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Payload 1 (Ghost Field Product Update)**: Unauthenticated attempt to overwrite a product's price to $0.01 with ghost fields `{ isFree: true }`.
2. **Payload 2 (Admin Role Spoofing)**: Regular customer writing `{ role: 'admin' }` to their own `/users/{uid}` document.
3. **Payload 3 (Order User Spoofing)**: Authenticated user A creating an order claiming `customer: { userId: 'victim-user-b' }`.
4. **Payload 4 (Order Scraping & Direct PII Get)**: Regular user or guest fetching another customer's order by ID or listing all orders.
5. **Payload 5 (Unverified Admin Claim Attack)**: User with `email_verified == false` attempting initial admin claim or admin writes.
6. **Payload 6 (ID Poisoning Attack)**: Writing to `/products/{productId}` with a 2KB junk character string.
7. **Payload 7 (Raw Materials Tampering)**: Customer writing to `/rawMaterials/{materialId}` to delete or alter food expiration dates.
8. **Payload 8 (Post-Bootstrap Admin Hijack)**: Regular authenticated user writing their own UID into `/admins/{uid}` after `/appConfig/bootstrap` already exists.
9. **Payload 9 (Product Type Poisoning)**: Attempting to set `price: "free"` (string instead of non-negative number).
10. **Payload 10 (Negative Price Injection)**: Creating an order with `total: -500`.
11. **Payload 11 (Oversized Description Attack)**: Creating a product with 50,000 characters in `description`.
12. **Payload 12 (Unauthorized Order Status Jump)**: Non-admin updating an order's status to `completed`.

## 3. Test Runner
See `firestore.rules.test.ts` for automated verification assertions against the security invariants.
