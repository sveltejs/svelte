---
question: How do I test Svelte apps?
---

There are a few approaches that people take when testing, but it generally involves compiling the component and mounting it to something and then performing the tests. You essentially need to create a bundle for each component you're testing (since svelte is a compiler and not a normal library) and then mount them. You can mount to a JSDOM instance. Or you can use a real browser powered by a library like Playwright, Puppeteer, or Cypress.

Some resources for getting started with unit testing:
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/example/)
- [Example using uvu test runner with JSDOM](https://github.com/lukeed/uvu/tree/master/examples/svelte)
