---
question: How do I test Svelte apps?
---

We don't have a good answer to this yet, but it is a priority. There are a few approaches that people take when testing, but it generally involves compiling the component and mounting it to something and then performing the tests.
You essentially need to create a bundle for each component you're testing (since svelte is a compiler and not a normal library) and then mount them. You can mount to a JSDOM instance, or you can use Puppeteer if you need a real browser, or you can use a tool like Cypress. There is an example of this in the Sapper starter template.
