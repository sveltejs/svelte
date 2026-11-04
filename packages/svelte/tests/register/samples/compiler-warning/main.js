import { render } from 'svelte/server';
import App from './App.svelte';

console.log(JSON.stringify({ body: render(App).body }));
