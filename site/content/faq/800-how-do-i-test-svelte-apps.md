---
question: How do I test Svelte apps?
---

How your application is structured and where logic is defined will determine the best way to ensure it is properly tested. It is important to note that not all logic belongs within a component - this includes concerns such as data transformation, cross-component state management, and logging, among others. Remember that the Svelte library has its own test suite, so you do not need to write tests to validate implementation details provided by Svelte.

A Svelte application will typically have three different types of tests: Unit, Component, and End-to-End (E2E).

*Unit Tests*: Focus on testing business logic in isolation. Often this is validating individual functions and edge cases. By minimizing the surface area of these tests they can be kept lean and fast, and by extracting as much logic as possible from your Svelte components more of your application can be covered using them. Popular tools for unit testing include [Jest](https://jestjs.io/), [vitest](https://vitest.dev/), and [Mocha](https://mochajs.org/).

*Component Tests*: Validating that a Svelte component mounts and interacts as expected throughout its lifecycle requires a tool that provides a Document Object Model (DOM). Components can be compiled (since Svelte is a compiler and not a normal library) and mounted to allow asserting against element structure, listeners, state, and all the other capabilities provided by a Svelte component. Tools for component testing range from an in-memory implementation like JSDOM to solutions that leverage an actual browser to provide a visual testing capability such as [Cypress](https://www.cypress.io/).

*End-to-End Tests*: To ensure your users are able to interact with your application it is necessary to test it as a whole in a manner as close to production as possible. This is done by writing E2E tests which load and interact with a deployed version of your application in order to simulate how the user will interact with your application. Tools that build E2E tests include [Cypress](https://www.cypress.io/), [Playwright](https://playwright.dev/), [Puppeteer](https://pptr.dev/), and [WebdriverIO](https://webdriver.io/).

Some resources for getting started with testing:
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/example/)
- [Svelte Component Testing in Cypress](https://docs.cypress.io/guides/component-testing/svelte/overview)
- [Example using vitest](https://github.com/vitest-dev/vitest/tree/main/examples/svelte)
- [Example using uvu test runner with JSDOM](https://github.com/lukeed/uvu/tree/master/examples/svelte)
- [Component testing with WebdriverIO](https://webdriver.io/docs/component-testing/svelte)
