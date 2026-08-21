import { on } from 'svelte/events';

// ---------------- on

on(document.body, 'click', (e) => e.button);

on(window, 'click', (e) => e.button);

on(document, 'click', (e) => e.button);

on(document.createElement('input'), 'input', (e) => e.currentTarget.value);

on(
	document.body,
	'clidck',
	(e) =>
		// @ts-expect-error
		e.button
);

on(
	// @ts-expect-error
	'asd',
	'asd',
	(e) => e
);
