import { render } from 'svelte/server';
// @ts-ignore you need to create this file
import App from './App.svelte';

export const { head, body } = render(App);
