# ALMS — Low-Level Design (LLD)

Source: `ALMS_Project-main.zip` (Django REST backend + React frontend)
Companion docs: HLD summary and UML/sequence/deployment diagrams (previous discussion)

---

## 1. Conventions used in this document

- **Module** = one source file / one cohesive unit of responsibility.
- Endpoint tables list: `Method | Path | View | Auth | Request | Response | Status codes`.
- "⚠" flags a defect or gap found while tracing the code (not a design recommendation, just what the code currently does).

---

## 2. Backend — `library_app` (Django app inside `alms_core` project)

### 2.1 Data model module — `models.py`

#### `Book`

| Field | Type | Constraints |
|---|---|---|
| `title` | `CharField(200)` | required |
| `author` | `CharField(100)` | required |
| `isbn` | `CharField(13)` | `unique=True` |
| `is_available` | `BooleanField` | default `True` — ⚠ never updated anywhere; `available_copies` is the field actually used for availability logic |
| `total_copies` | `IntegerField` | default `1` |
| `available_copies` | `IntegerField` | default `1` |

No `topic` field exists, despite `BookViewSet.search_fields` referencing it (see 2.3).

#### `Member`

| Field | Type | Constraints |
|---|---|---|
| `user` | `OneToOneField(User)` | `on_delete=CASCADE`, `related_name='member'`, `null=True` |
| `member_id` | `CharField(20)` | `unique=True` |
| `name` | `CharField(100)` | required |
| `department` | `CharField(100)` | required |

Links a library member to Django's built-in auth `User`. `null=True` means a `User` can exist without a `Member` — any such user will 500 on any endpoint that does `request.user.member` (see 2.3, `TransactionViewSet`).

#### `Transaction`

| Field | Type | Constraints |
|---|---|---|
| `book` | `ForeignKey(Book)` | `on_delete=CASCADE` |
| `member` | `ForeignKey(Member)` | `on_delete=CASCADE` |
| `issue_date` | `DateField` | `auto_now_add=True` |
| `due_date` | `DateField` | required, set by caller |
| `return_date` | `DateField` | `null=True, blank=True` |

**Method — `calculate_fine() -> int`**
```
if return_date is set:
    if return_date > due_date: return (return_date - due_date).days * 5
    else: return 0
elif today > due_date:
    return (today - due_date).days * 5
else:
    return 0
```
Rate is a hardcoded `5` (currency unit implied as Rs. by the frontend). This is a **computed value, not a stored column** — important for 2.3.

**Entity relationships**: `User 1—0..1 Member`, `Member 1—* Transaction`, `Book 1—* Transaction`.

---

### 2.2 Serialization module — `serializers.py`

| Serializer | Model | Fields | Notes |
|---|---|---|---|
| `BookSerializer` | `Book` | `__all__` | plain `ModelSerializer` |
| `MemberSerializer` | `Member` | `__all__` | plain `ModelSerializer` |
| `TransactionSerializer` | `Transaction` | `id, book, member, issue_date, due_date, return_date, fine` | `fine` is a `SerializerMethodField` calling `obj.calculate_fine()`; also declares read-only `book_title`/`book_author` sourced from `book.title`/`book.author` — used by the frontend tables |
| `MyTokenObtainPairSerializer` | — (extends `TokenObtainPairSerializer`) | — | overrides `get_token()` to add `is_staff` claim to the JWT payload |

⚠ The serializer declares `due_date = CharField(source='book.due_date')` and `issue_date = CharField(source='book.due_date')` as read-only fields sourced from **`book.due_date`/`book.issue_date`**, but `Book` has no such attributes — these two declared fields shadow the real `Transaction.due_date`/`issue_date` model fields and will raise an `AttributeError` on serialization if actually hit (in practice they're overwritten by DRF's model-field introspection order at runtime; behavior depends on DRF version — flagged as fragile).

---

### 2.3 API / business-logic module — `views.py`

| Method | Path | View | Auth | Request body | Success response | Notes / Logic flow |
|---|---|---|---|---|---|---|
| `GET/POST` | `/api/books/` | `BookViewSet` (ModelViewSet) | none (open) | — / `{title, author, isbn, ...}` | `Book` list / created object | `SearchFilter` on `search_fields=['title','author','topic']` — ⚠ `topic` does not exist on `Book`, this will raise a `FieldError` the moment a search query is issued |
| `GET/PUT/PATCH/DELETE` | `/api/books/{id}/` | `BookViewSet` | none | — | `Book` object | Full CRUD, unauthenticated — ⚠ anyone can create/edit/delete books |
| `GET/POST/PUT/DELETE` | `/api/members/` , `/api/members/{id}/` | `MemberViewSet` | none | `{member_id, name, department, user}` | `Member` object(s) | Also fully open — no auth required |
| `GET` | `/api/transactions/` | `TransactionViewSet` | **JWT required** | — | List of transactions **for `request.user.member` only** | `get_queryset()` hardcodes `Transaction.objects.filter(member=request.user.member)` — same behavior for staff and non-staff users (see admin sequence diagram) |
| `POST` | `/api/token/` | `TokenObtainPairView` (djangorestframework-simplejwt) | none | `{username, password}` | `{access, refresh}` | Uses `MyTokenObtainPairSerializer`; JWT payload includes `is_staff` |
| `POST` | `/api/token/refresh/` | `TokenRefreshView` | none | `{refresh}` | `{access}` | Standard SimpleJWT refresh |
| `POST` | `/api/reserve/` | `reserve_book` (function view) | **JWT required** | `{book: <id>}` | `{message: "Reserved successfully!"}` / `400 {error: "Out of Stock"}` | Logic: fetch `Book` by id → if `available_copies > 0`: create `Transaction(member=request.user.member, book, issue_date=now, due_date=now+14d)`, decrement `available_copies`, save → else return 400 |
| `PUT` | `/api/return/{transaction_id}/` | `return_book` (function view) | **JWT required** | — | `{message: "Returned!"}` | Logic: fetch `Transaction` by id (⚠ no ownership check — any authenticated user can mark **any** transaction returned by id) → set `return_date=now` → increment `book.available_copies` |
| `POST` | `/api/pay-fines/` | `pay_fines` (function view) | **JWT required** | — | `{message: "Fines cleared"}` | ⚠ **Broken**: `Transaction.objects.filter(member=request.user.member, fine__gt=0)` — `fine` is not a model field (it's a method on the serializer/model instance), so this queryset raises `django.core.exceptions.FieldError` at call time |
| `GET/POST/...` | `/admin/...` | Django admin site | Django session auth (superuser) | — | HTML admin pages | Registered models: `Member`, `Transaction` (default admin), `Book` (custom `BookAdmin` with `list_display`) — this is a **separate admin surface**, bypassing the REST API entirely |

**Error-handling pattern**: views mostly use direct `Model.objects.get(...)`, which raises unhandled `DoesNotExist` (→ Django 500) rather than DRF's `get_object_or_404`. No `try/except` blocks anywhere in `views.py`.

---

### 2.4 Routing module — `urls.py`

- `DefaultRouter()` auto-registers `books`, `members`, `transactions` → generates the full REST CRUD path set (`list`, `create`, `retrieve`, `update`, `partial_update`, `destroy`) for each.
- Explicit paths layered on top: `admin/`, `api/token/`, `api/token/refresh/`, `api/reserve/`, `api/pay-fines/`, `api/return/<int:transaction_id>/`.
- All API paths are namespaced under `api/`.

### 2.5 Auth module — JWT via `rest_framework_simplejwt`

- `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES = [JWTAuthentication]` — applies globally to any view with `permission_classes=[IsAuthenticated]`.
- `SIMPLE_JWT.TOKEN_OBTAIN_PAIR_SERIALIZER` points at the custom serializer that injects `is_staff`.
- ⚠ `is_staff` is embedded in the token but **never read anywhere in `views.py`** — role/permission decisions are made entirely on the frontend by decoding the JWT and checking `user_id === "1"`, not by this claim.
- Token lifetime, rotation, blacklist: not configured — defaults from `simplejwt` apply (no explicit `SIMPLE_JWT` lifetime settings present).

### 2.6 Settings module — `alms_core/settings.py`

- `DATABASES`: PostgreSQL via `psycopg2-binary`, credentials from `.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) loaded with `python-dotenv`.
- `CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]`, `CORS_ALLOW_CREDENTIALS = True`.
- `DEBUG = True`, `ALLOWED_HOSTS = []`, `SECRET_KEY` hardcoded in source — dev-only configuration (see deployment diagram from earlier).

---

## 3. Frontend — React (`frontend/src`)

### 3.1 HTTP client module — `api.js`

**Interface**: exports a configured Axios instance (`API`).

| Aspect | Detail |
|---|---|
| Base URL | `http://localhost:8000/api/` (hardcoded) |
| Request interceptor | reads `localStorage['access']`, sets `Authorization: Bearer <token>` on every outgoing request |
| Response interceptor | on `401`, clears `access`/`refresh` from `localStorage` and hard-redirects to `/login` (⚠ no such route exists in this single-page, router-less app — this will just reload to `App.js`'s default unauthenticated view, not a dedicated `/login` page) |

All components except `Login.js` use this instance. `Login.js` uses a raw `axios.post('/api/token/', ...)` call instead (relative URL, relies on CRA's `proxy` field in `package.json` pointing to `localhost:8000`) — inconsistent with the rest of the app's absolute-URL `API` instance.

### 3.2 Root/composition module — `App.js`

**State**: `isAuthenticated: bool` (init from `localStorage['access']` presence), `isStaff: bool` (declared, ⚠ never actually set/used for branching).

**Logic flow**:
1. On render, read `access` token from `localStorage`.
2. If present, `jwtDecode(token)` → `user`.
3. If `!isAuthenticated` → render `<Login/>` + `<BookList/>` (public catalog view).
4. Else if `user.user_id === "1"` → render `<AdminDashboard/>` + `<AdminCirculation/>`.
5. Else → render `<MemberDashboard/>` + `<BookList/>`.
6. `handleLogout()` clears both tokens and hard-reloads to `/`.

This is the sole "routing" layer — there is no `react-router-dom` usage despite it being listed as a documented setup step in the README; role-based view selection is a plain conditional render.

### 3.3 `Login.js`

**Props**: `setAuth` (declared in signature, ⚠ never passed by `App.js`, so it's always `undefined` and never called).
**State**: `credentials: {username, password}`.
**Logic flow**: on submit → `axios.post('/api/token/', credentials)` → store `access`/`refresh` in `localStorage` → `window.location.reload()`. On failure → `alert('Invalid username or password.')`.

### 3.4 `BookList.js`

**State**: `books: []`, `search: string`.
**Logic flow**:
1. On mount, `loadBooks()` → `API.get('books/', {params: {search: ''}})`.
2. On each keystroke in the search box, `loadBooks(value)` fires a new request immediately (⚠ no debounce — one API call per keystroke).
3. `handleReserve(bookId)` → `API.post('reserve/', {book: bookId})` → alert server message → reload list.
4. Reserve button disabled when `available_copies <= 0`.

### 3.5 `MemberDashboard.js`

**State**: `transactions: []`.
**Logic flow**:
1. On mount, `API.get('transactions/')` → populate `transactions`.
2. Derives `activeFineTransactions = transactions.filter(t => t.fine > 0 && !t.return_date)` and `totalOutstanding` client-side (duplicate of backend `calculate_fine` logic, display-only).
3. `handleReturn(id)` → `API.put('return/{id}/')` → reload.
4. `handlePayFines()` → `API.post('pay-fines/')` → reload. (⚠ this call will always fail server-side per 2.3; frontend shows a generic alert on catch.)
5. Renders table of all transactions (title/author/fine/status) + embeds `<FineDashboard/>` with the active-fine subset.

### 3.6 `FineDashboard.js` (presentational, no data fetching)

**Props**: `fines: Transaction[]`, `onPay: () => void`.
**Logic flow**: sums `fines` client-side into `totalOwed`; renders a summary + a details table; shows "Pay Fines" button (calls `onPay`) only if `fines.length > 0`; shows a "good standing" message otherwise.

### 3.7 `AdminDashboard.js`

No state, no data fetching. Renders three buttons that `window.location.href` directly to Django admin URLs (`/admin/library_app/book|member|transaction/`) — a hard navigation out of the SPA into Django's server-rendered admin, authenticated separately via Django session/superuser login (not the JWT used elsewhere).

### 3.8 `AdminCirculation.js`

**State**: `transactions: []`, `loading: bool`.
**Logic flow**:
1. On mount, `API.get('transactions/')` (same endpoint and same member-scoped queryset as `MemberDashboard.js` — see 2.3 note on scoping).
2. Client-side role gate: decode JWT from `localStorage`, `isStaff = decoded.user_id === "1"`; if not staff, render "Access Denied" and stop (⚠ this is a UI-only gate — the underlying `/api/transactions/` call already executed before the check, and nothing prevents a non-"1" user from calling the API directly).
3. If staff, render a table of all fetched transactions with a "Mark as Returned" action → `API.put('return/{id}/')` → reload.
4. Computes `totalFees` client-side by summing `fine` across the fetched transactions.

---

## 4. Cross-cutting concerns

| Concern | Current state |
|---|---|
| **AuthN** | JWT (SimpleJWT) for API; separate Django session auth for `/admin/` — two disjoint auth systems |
| **AuthZ** | No server-side role checks anywhere in `views.py`; all role logic (`user_id === "1"`) is client-side and trivially bypassable via direct API calls |
| **Validation** | Relies entirely on DRF `ModelSerializer` defaults (type/uniqueness); no custom `validate_*` methods; no stock/duplicate-reservation guard beyond the `available_copies > 0` check in `reserve_book` |
| **Error handling** | No `try/except` in backend views; unhandled exceptions surface as Django 500s; frontend uses `alert()` for all error/success feedback, no toast/notification system |
| **Fine calculation** | Single source of truth is `Transaction.calculate_fine()` on the backend; frontend re-derives the same sum in three places (`MemberDashboard.js`, `AdminCirculation.js`, `FineDashboard.js`) for display only — no write-back, so no drift risk, but three places to keep in sync if the rate/logic ever changes |
| **Known defects surfaced by this LLD pass** | (1) `pay_fines` queryset references non-existent `fine` field — will 500. (2) `BookViewSet.search_fields` references non-existent `topic` field — will 500 on search. (3) `return_book` has no ownership check. (4) `TransactionViewSet` queryset doesn't distinguish staff from member — admins don't see the full circulation desk data set. (5) `Login.js`'s `setAuth` prop is dead code. (6) No debounce on book search. |

---

## 5. Traceability to earlier diagrams

- **Component diagram** ↔ §2 (backend tiers) and §3 (frontend tiers).
- **Class diagram** ↔ §2.1.
- **Login sequence** ↔ §2.5 + §3.3.
- **Reserve/return sequence** ↔ §2.3 (`reserve_book`, `return_book`) + §3.4/§3.5.
- **Admin circulation sequence** ↔ §2.3 (`TransactionViewSet` scoping defect) + §3.8.
- **Deployment diagram** ↔ §2.6.
