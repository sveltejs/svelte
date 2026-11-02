import { render } from 'svelte/server';
import App from './App.svelte';
import { css } from './App.svelte' with { as: 'source' };

console.log(JSON.stringify({ head: render(App).head, css }));
