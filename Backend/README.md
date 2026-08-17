# E-Commerce Backend (NestJS + TypeORM + PostgreSQL)

Covers **signup**, **login**, **cart**, and **order placement (delivery)**.

## Stack
- NestJS (TypeScript)
- TypeORM + PostgreSQL
- Passport JWT for authentication
- bcrypt for password hashing
- class-validator / class-transformer for DTO validation and response serialization

## Setup

```bash
npm install
cp .env.example .env
# edit .env with your Postgres credentials and a strong JWT_SECRET
```

Create the database first (matching `DB_NAME` in `.env`):

```bash
createdb ecommerce
```

Run it:

```bash
npm run start:dev   # watch mode
# or
npm run build && npm run start:prod
```

`synchronize: true` is set in `app.module.ts` so TypeORM auto-creates tables in dev. **Turn this off and use migrations before production.**

## Auth
Protected routes require header: `Authorization: Bearer <token>`

| Method | Route              | Auth | Body |
|--------|---------------------|------|------|
| POST   | `/api/auth/signup`  | No   | `{ name, email, password }` |
| POST   | `/api/auth/login`   | No   | `{ email, password }` |
| GET    | `/api/auth/me`      | Yes  | — |

## Products
(minimal endpoints so cart/orders have real items to reference)

| Method | Route                | Auth | Body |
|--------|------------------------|------|------|
| GET    | `/api/products`       | No   | — |
| GET    | `/api/products/:id`   | No   | — |
| POST   | `/api/products`       | Yes* | `{ name, description, price, stock, imageUrl, category }` |

\* In production, add a `role` field on `User` and guard this with an admin-only check.

## Cart

| Method | Route                          | Auth | Body |
|--------|----------------------------------|------|------|
| GET    | `/api/cart`                     | Yes  | — |
| POST   | `/api/cart/add`                 | Yes  | `{ productId, quantity }` |
| PUT    | `/api/cart/update`               | Yes  | `{ productId, quantity }` |
| DELETE | `/api/cart/remove/:productId`   | Yes  | — |
| DELETE | `/api/cart/clear`                | Yes  | — |

## Orders (Place Delivery / Checkout)

| Method | Route                     | Auth | Body |
|--------|-----------------------------|------|------|
| POST   | `/api/orders/place`        | Yes  | `{ deliveryAddress: { line1, line2, city, state, postalCode, country, phone }, paymentMethod }` |
| GET    | `/api/orders`               | Yes  | — |
| GET    | `/api/orders/:id`           | Yes  | — |
| PATCH  | `/api/orders/:id/cancel`    | Yes  | — |

`placeOrder`:
- Runs inside a single TypeORM transaction (`DataSource.transaction`)
- Reads the user's cart, row-locks each product (`pessimistic_write`) and checks stock
- Decrements product stock, creates the `Order` + `OrderItem`s, empties the cart
- If anything fails, the whole transaction rolls back — no partial orders or stock drift

## Example flow

```bash
# 1. Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'

# 2. Login (returns a token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'

# 3. Add to cart
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"productId":"<PRODUCT_ID>","quantity":2}'

# 4. Place order
curl -X POST http://localhost:5000/api/orders/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
        "deliveryAddress": {
          "line1": "123 Main St",
          "city": "Kathmandu",
          "postalCode": "44600",
          "country": "Nepal",
          "phone": "9800000000"
        },
        "paymentMethod": "cod"
      }'
```

## Project structure

```
src/
  auth/         signup, login, JWT strategy/guard, current-user decorator
  users/        User entity + service (used internally by auth)
  products/     Product entity, service, controller
  cart/         Cart + CartItem entities, service, controller
  orders/       Order + OrderItem entities, service, controller
  app.module.ts TypeORM connection + module wiring
  main.ts       bootstrap, global ValidationPipe, response serialization
```

## Notes / next steps
- Add an admin `role` field on `User` to guard product management and order-status transitions (`out_for_delivery`, `delivered`, etc.).
- Replace `synchronize: true` with TypeORM migrations before deploying.
- Add refresh tokens if you need shorter-lived access tokens with renewal.
- Add rate limiting on `/api/auth/*` (e.g. `@nestjs/throttler`) to slow brute-force attempts.
