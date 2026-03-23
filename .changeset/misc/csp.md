# Content Security Policy (CSP) Support

Svelte provides built-in support for Content Security Policy (CSP), a computer security concept to help detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks.

## Introduction to CSP
CSP is a security feature that helps detect and mitigate certain types of attacks by defining which sources of content are allowed to be executed within a web page.

## Hydratable Components
Svelte's hydratable components can be used with CSP. For more information, see [Hydratable Components](https://svelte.dev/docs/svelte/hydratable#CSP).

## Trusted Types
If you need to use [Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API), you can use `trusted-types svelte-trusted-html`. Additionally, you can use `{@html policy.createHTML(html)}` to create trusted HTML. For example:
```svelte
<script>
  import { policy } from 'your-policy-module';
  let html = '<p>Hello, World!</p>';
</script>
{@html policy.createHTML(html)}
```
