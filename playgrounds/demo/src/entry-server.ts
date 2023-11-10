// @ts-ignore
import { render } from 'svelte/server';
// @ts-ignore you need to create this file
import App from './App.svelte';

// @ts-ignore
export const { head, html, css } = render(App, { props: { initialCount: 0 } });
