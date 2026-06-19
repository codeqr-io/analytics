'use client';

export default function AutoFormTestPage() {
  // Forms submit to themselves; a page-level preventDefault keeps the page
  // stable during tests while the SDK's capture-phase listener still runs first.
  return (
    <main style={{ padding: 24 }}>
      <h1>Auto Form Test</h1>

      <form
        id="allowed-attr"
        data-codeqr-conversion
        data-codeqr-event-name="Newsletter"
        onSubmit={(e) => e.preventDefault()}
      >
        <input name="email" type="email" defaultValue="attr@example.com" />
        <input name="name" type="text" defaultValue="Attr User" />
        <button type="submit">Submit attr</button>
      </form>

      <form
        id="allowed-selector"
        className="cq-autoform"
        onSubmit={(e) => e.preventDefault()}
      >
        <input name="email" type="email" defaultValue="selector@example.com" />
        <input
          name="full_name"
          autoComplete="name"
          defaultValue="Selector User"
        />
        <input name="phone" type="tel" defaultValue="+15550001111" />
        <input name="company" type="text" defaultValue="Acme" />
        <input name="role" type="text" data-codeqr-capture defaultValue="CTO" />
        <input name="password" type="password" defaultValue="hunter2" />
        <input name="secret" type="hidden" defaultValue="should-not-leak" />
        <input
          name="cc-number"
          autoComplete="cc-number"
          defaultValue="4242424242424242"
        />
        <input name="otp" autoComplete="one-time-code" defaultValue="123456" />
        <button type="submit">Submit selector</button>
      </form>

      <form id="not-allowed" onSubmit={(e) => e.preventDefault()}>
        <input name="email" type="email" defaultValue="nobody@example.com" />
        <button type="submit">Submit not-allowed</button>
      </form>

      <form
        id="ignored"
        className="cq-autoform"
        data-codeqr-ignore
        onSubmit={(e) => e.preventDefault()}
      >
        <input name="email" type="email" defaultValue="ignored@example.com" />
        <button type="submit">Submit ignored</button>
      </form>

      <form
        id="no-email"
        className="cq-autoform"
        onSubmit={(e) => e.preventDefault()}
      >
        <input name="full_name" autoComplete="name" defaultValue="Anon User" />
        <button type="submit">Submit no-email</button>
      </form>
    </main>
  );
}
