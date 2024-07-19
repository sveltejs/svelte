import type { Snippet } from 'svelte';

// @ts-expect-error
const a: Snippet<{ text: string }> = () => {};
// @ts-expect-error
const b: Snippet<boolean> = (a, b) => {};
// @ts-expect-error
const c: Snippet<boolean> = (a: string) => {};
// @ts-expect-error
const d: Snippet<boolean> = (a: string, b: number) => {};
// @ts-expect-error
const e: Snippet = (a: string) => {};
const f: Snippet = (a) => {
	// @ts-expect-error
	a?.x;
};
const g: Snippet<[boolean]> = (internals, a) => {
	// @ts-expect-error
	a() === '';
	a() === true;
};
const h: Snippet<[{ a: true }]> = (internals, a) => {
	a().a === true;
};
const i: Snippet = () => {};
