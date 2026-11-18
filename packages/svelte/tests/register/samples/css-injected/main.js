import { render } from 'svelte/server';
import App from './App.svelte';
import source, { css } from './App.svelte' with { as: 'source' };

console.log(
	JSON.stringify({
		head: render(App).head,
		source_injects_css: /color:\s*red/.test(source),
		css
	})
);
