# Frontend Error Handling

This doc describes how the client app handles errors coming from the API. The
goal is consistency: every API failure flows through one parser, one router,
and a small set of UI primitives.

## The contract

The backend's global error handler returns:

```json
{
  "status": "fail" | "error",
  "message": "Human-readable string",
  "errors": [{ "path": "body.email", "message": "Invalid email" }]
}
```

`errors` is only present on validation failures (400/422). The rest of the
shape is constant. Any deviation from `{ message: string }` is treated as a
non-API body (proxy HTML, edge response, malformed JSON) and mapped to a
generic message tagged with `isUnknownShape: true`.

## Layers

```
axios → toApiError → ApiError instance → react-query cache hooks
                                       → handleApiError (toast / redirect)
                                       → useApiError (form field errors)
                                       → ErrorView (page UI)
```

### 1. The parser — `src/lib/errors/parse.js`

`toApiError(axiosError)` returns an `ApiError` for every failure case:

| Case | `status` | `code` |
|---|---|---|
| Request canceled | 0 | `CANCELED` |
| No response (offline / DNS) | 0 | `NETWORK` |
| 401 | 401 | `UNAUTHORIZED` |
| 403 | 403 | `FORBIDDEN` |
| 404 | 404 | `NOT_FOUND` |
| 400 / 422 | 400/422 | `VALIDATION` |
| 429 | 429 | `RATE_LIMIT` |
| 5xx | 5xx | `SERVER` |
| Other 4xx | n | `GENERIC` |

`fieldErrors` is a flat `{ [name]: message }` map built from `errors[].path`
with `body.` / `params.` / `query.` prefixes stripped.

### 2. The interceptor — `src/lib/api.js`

The single axios instance rejects with the parsed `ApiError`. `ApiError`
extends `Error`, so legacy reads (`err.message`, `err.status`) keep working.

### 3. The global handler — `src/lib/errors/handler.js`

`handleApiError(err, meta)` performs the side effect:

- **401** → toast + full-page redirect to `/login?redirect=<here>` (skipped on `/login` and `/register`)
- **403** → toast `"You don't have permission to do that"`
- **404** → no toast (page-level UI shows it)
- **400/422** → toast (unless `meta.silentFieldErrors` and there are field errors)
- **429** → rate-limit toast
- **NETWORK** → "you appear to be offline" toast
- **5xx** → toast with a "Try again" action that reloads
- Same code within 1.5s is throttled to one toast (prevents storms)

It is plumbed into react-query via `QueryCache.onError` and
`MutationCache.onError` in `QueryProvider`. Per-query/per-mutation `meta`
overrides:

| meta key | effect |
|---|---|
| `silent401` | don't toast/redirect on 401 (used by `getMe`) |
| `silentError` | the call site handles its own UX |
| `silentFieldErrors` | don't toast 400/422 if field errors are present |

### 4. Form errors — `src/hooks/useApiError.js`

```jsx
const form = useForm({ resolver: zodResolver(loginSchema) })
const { handle } = useApiError({ form })

const onSubmit = async (values) => {
  try {
    await login(values)
  } catch (e) {
    handle(e) // routes field errors inline; falls through to global otherwise
  }
}
```

When `e.fieldErrors` is set, each entry calls `form.setError(name, …)` and the
toast is suppressed.

### 5. Page-level UI — `src/components/common/ErrorView.jsx`

Detail / list pages branch on the error:

```jsx
if (isError || !product) {
  return (
    <ErrorView
      error={error}
      onRetry={() => refetch()}
      homeHref="/shop"
      homeLabel="Back to shop"
      fallback={{ title: 'Product not found', cta: 'home' }}
    />
  )
}
```

Distinct UI for `NETWORK`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, and
`SERVER`. Falls back to `fallback` when `error` is not an ApiError.

## i18n

Two dictionaries live in `src/lib/errors/messages.{en,ar}.json`. The active
locale defaults to `en`. To switch:

```js
import { setLocale } from '@/lib/errors/messages'
setLocale('ar')
```

The dictionaries cover the fixed labels (e.g. `RETRY`, `NETWORK`). Server-sent
messages still come through in whatever language the API returns.

## How to add a new error code

1. Add a status branch in `codeFor()` in `parse.js` if needed.
2. Add a branch in `handleApiError()` for the side effect.
3. Add a translation key in both `messages.en.json` and `messages.ar.json`.
4. (Optional) Branch on it in `ErrorView` if it deserves dedicated UI.

## How to add a new query/mutation

Don't add `onError`. The global handler already toasts. Use `meta` to opt out:

```js
useQuery({
  queryKey: ['analytics', 'private'],
  queryFn: getStats,
  meta: { silentError: true },     // I'll show errors my own way
})
```

```js
useMutation({
  mutationFn: createThing,
  meta: { silentFieldErrors: true }, // I'll set form errors via useApiError
})
```

## Manual test checklist

- [ ] **Login wrong password** → toast (no field error since BE returns 401)
- [ ] **Register taken email** (Zod 400 with `errors[]`) → field error on `email`, no toast
- [ ] **Register weak password** → field errors on each failing field
- [ ] **Open `/account/orders` after deleting your session cookie** → full-page redirect to `/login?redirect=/account/orders`, toast shown
- [ ] **Already on `/login` and request 401s** → toast only, no redirect bounce
- [ ] **Hit a non-existent product slug** → ProductDetailPage shows the not-found ErrorView
- [ ] **Disable network in devtools** → mutate cart → "you're offline" toast, no app crash
- [ ] **Stop the API server** → ShopPage → ErrorView with "Try again" button that refetches
- [ ] **Backend returns malformed body (e.g. nginx HTML)** → generic message with `isUnknownShape` flag, no white screen
- [ ] **Multiple parallel queries fail** → only one toast for the same code (1.5s throttle)
- [ ] **Cancel a query (StrictMode unmount)** → no toast
- [ ] **getMe returns 401 (guest path)** → no toast, no redirect (silent401 meta)
- [ ] **Cart merge fails after login** → no double toast (handled globally only)
