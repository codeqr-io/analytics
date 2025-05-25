# Test info

- Name: should fire /track/visit and set cq_id cookie when data-domains.site is set
- Location: /Users/deusdete/Work/projects/codeqr-analytics/apps/nextjs/tests/track-visit.spec.ts:3:5

# Error details

```
Error: expect(received).toBeDefined()

Received: undefined

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
    at /Users/deusdete/Work/projects/codeqr-analytics/apps/nextjs/tests/track-visit.spec.ts:36:6
```

# Page snapshot

```yaml
- main:
    - paragraph:
        - text: Get started by editing
        - code: app/page.tsx
    - link "By Vercel Logo":
        - /url: https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app
        - text: By
        - img "Vercel Logo"
    - img "Next.js Logo"
    - link "Docs -> Find in-depth information about Next.js features and API.":
        - /url: https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app
        - heading "Docs ->" [level=2]
        - paragraph: Find in-depth information about Next.js features and API.
    - link "Learn -> Learn about Next.js in an interactive course with quizzes!":
        - /url: https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app
        - heading "Learn ->" [level=2]
        - paragraph: Learn about Next.js in an interactive course with quizzes!
    - link "Templates -> Explore starter templates for Next.js.":
        - /url: https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app
        - heading "Templates ->" [level=2]
        - paragraph: Explore starter templates for Next.js.
    - link "Deploy -> Instantly deploy your Next.js site to a shareable URL with Vercel.":
        - /url: https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app
        - heading "Deploy ->" [level=2]
        - paragraph: Instantly deploy your Next.js site to a shareable URL with Vercel.
- alert
```

# Test source

```ts
   1 | import { expect, test } from '@playwright/test';
   2 |
   3 | test('should fire /track/visit and set cq_id cookie when data-domains.site is set', async ({
   4 |   page,
   5 | }) => {
   6 |   const [request, response] = await Promise.all([
   7 |     page.waitForRequest(
   8 |       (request) =>
   9 |         request.url().includes('/track/visit') && request.method() === 'POST',
  10 |     ),
  11 |
  12 |     page.waitForResponse(
  13 |       (response) =>
  14 |         response.url().includes('/track/visit') && response.status() === 200,
  15 |     ),
  16 |
  17 |     page.goto('/'),
  18 |   ]);
  19 |
  20 |   const postData = JSON.parse(request.postData() || '{}');
  21 |   expect(postData).toMatchObject({
  22 |     domain: expect.any(String),
  23 |     url: expect.any(String),
  24 |     referrer: expect.any(String),
  25 |   });
  26 |
  27 |   const responseData = await response.json();
  28 |
  29 |   // Wait for the cq_id cookie to be set
  30 |   await expect(async () => {
  31 |     const cookies = await page.context().cookies();
  32 |     const codeqrIdCookie = cookies.find((cookie) => cookie.name === 'cq_id');
  33 |
  34 |     expect(codeqrIdCookie).toBeDefined();
  35 |     expect(codeqrIdCookie?.value).toBe(responseData.clickId);
> 36 |   }).toPass({ timeout: 5000 });
     |      ^ Error: expect(received).toBeDefined()
  37 | });
  38 |
```
