## 1. Routing, API Client, and Auth Context Foundations (KAN-51, KAN-56)

- [x] 1.1 Add `react-router-dom` to `frontend/package.json` and wire up a router in `frontend/src/main.tsx`/`App.tsx` with `/login`, `/signup`, and a placeholder protected route
- [x] 1.2 `VITE_API_BASE_URL` / `frontend/.env.example` / `frontend/src/config/env.ts` already existed from KAN-86 — reused as-is, nothing new to add
- [x] 1.3 Add `frontend/src/api/client.ts`: a `fetch` wrapper (`apiClient`) that resolves against `env.apiBaseUrl`, attaches `Authorization: Bearer <token>` when a token is passed, parses JSON, and surfaces non-2xx responses as a typed `ApiError`; plus `frontend/src/api/auth.ts` with typed `registerUser`/`login`/`getCurrentUser` calls, re-exported from `frontend/src/api/index.ts` (extended, not replaced — it already exported `API_BASE_URL`)
- [x] 1.4 Add `frontend/src/context/AuthContext.tsx` with an `AuthProvider` holding `{ user, status }` and `login(email, password)`, `signup(email, password)`, `logout()` actions calling the `api` module
- [x] 1.5 Persist the access token to `localStorage` on login/signup and clear it on logout
- [x] 1.6 On app load, read a stored token, call `GET /auth/me` to validate it, and populate `user`/mark the session restored, or clear the stored token if the call is rejected
- [x] 1.7 Wrap `App` with `AuthProvider` (inside `BrowserRouter`) in `frontend/src/main.tsx`

## 2. Protected Route (KAN-56)

- [x] 2.1 Add `frontend/src/components/ProtectedRoute.tsx` that renders its children when `AuthContext` reports an authenticated user, and otherwise redirects to `/login`
- [x] 2.2 Preserve the originally requested location on redirect (via router `state.from.pathname`) and return the person to it after a successful login
- [x] 2.3 Apply `ProtectedRoute` to the `/dashboard` route in `frontend/src/App.tsx` (`/` redirects to `/dashboard`, `/dashboard` is a placeholder page for now)

## 3. Signup Page (KAN-45)

- [x] 3.1 Add `react-hook-form`, `zod`, and `@hookform/resolvers` to `frontend/package.json`
- [x] 3.2 Add `frontend/src/schemas/auth.ts` with `loginSchema`/`signupSchema` `zod` schemas sharing an email validator
- [x] 3.3 Add `frontend/src/pages/Signup.tsx`: email/password form using `react-hook-form` + `signupSchema`, showing per-field validation errors before submission
- [x] 3.4 On submit, call `AuthContext.signup`; on success navigate to `/dashboard`; on a duplicate-email (400 `ApiError`) response, show an inline error and keep the person on the form
- [x] 3.5 Route `/signup` to `SignupPage` in `frontend/src/App.tsx`

## 4. Login Page (KAN-48)

- [x] 4.1 Add `frontend/src/pages/Login.tsx`: email/password form using `react-hook-form` + `loginSchema`, showing per-field validation errors before submission
- [x] 4.2 On submit, call `AuthContext.login`; on success navigate to the originally requested route (from 2.2) or `/dashboard`
- [x] 4.3 On an invalid-credentials (401 `ApiError`) response, show a single generic error that does not distinguish unknown email from wrong password
- [x] 4.4 Route `/login` to `LoginPage` in `frontend/src/App.tsx`

## 5. Frontend Authentication Tests (KAN-61)

- [x] 5.1 Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` to `frontend/package.json`; add `test`/`test:watch` scripts, a Vitest config block in `vite.config.ts` (jsdom environment), and `frontend/src/test/setup.ts` (jest-dom matchers + automatic RTL `cleanup()` between tests)
- [x] 5.2 Add `frontend/src/pages/Signup.test.tsx`: blocked submission on invalid input, successful signup, duplicate-email error shown
- [x] 5.3 Add `frontend/src/pages/Login.test.tsx`: blocked submission on invalid input, successful login (default and redirect-preserving cases), invalid-credentials error shown
- [x] 5.4 Add `frontend/src/context/AuthContext.test.tsx`: login/signup populate and persist the session, logout clears it, an existing valid token is restored on load, an existing invalid/expired token is cleared on load
- [x] 5.5 Add `frontend/src/components/ProtectedRoute.test.tsx`: unauthenticated visitor is redirected to `/login` (with the origin route captured in redirect state), authenticated person sees the protected content, loading state renders nothing
- [x] 5.6 Full suite passes (`npm run test` — 4 files, 16 tests); typecheck (`tsc -b`), lint (`eslint .`), and `npm run build` all pass; `npm run test`/`npm run test:watch` added to `frontend/package.json` scripts as the documented way to run tests
