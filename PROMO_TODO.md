# Promo Feature Implementation TODO

## Step 1: Update promoService.ts
- [x] Add new fields to PromoCode interface: `min_purchase`, `promo_products`, `promo_packages`
- [x] Add new methods: `assignProducts()`, `assignPackages()`, `getPromoCodeAssignments()`
- [x] Update ValidatePromoCodeInput to include `product_id`

## Step 2: Update AdminPromoCodes.tsx
- [x] Add state for managing product/package assignments
- [x] Add UI for viewing/assigning products to promo code
- [x] Add UI for viewing/assigning packages to promo code
- [x] Add dialog for selecting products/packages
- [x] Add API calls for assigning products/packages

## Step 3: Update UserCheckout.tsx
- [x] Pass `product_id` when validating promo code

## Step 4: Test the implementation
- [ ] Test assigning products to promo code
- [ ] Test assigning packages to promo code
- [ ] Test promo code validation with product context
- [ ] Test order creation with promo code

