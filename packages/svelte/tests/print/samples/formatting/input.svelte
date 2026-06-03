<script>import { setLocale } from '$lib/paraglide/runtime';import { m } from '$lib/paraglide/messages.js';</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1><div><button onclick={() => setLocale('en')}>en</button><button	onclick={() => setLocale('es')}>es</button></div><p>If you use VSCode, install the <a href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension" target="_blank">Sherlock i18n extension</a>for a better i18n experience.</p>

<Component><div><button>Hello, this is a test</button><button>Hello, this is a test</button></div></Component>
<Component><button>Hello, this is a test</button><button>Hello, this is a test</button></Component>
<button class="foo bar" aria-label="click" onclick={() => console.log("clicked")}>Click me!</button>
<button class="foo bar" aria-label="click" onclick={() => console.log("clicked")}><span>some fancy looking</span><span>really long button text</span></button>
