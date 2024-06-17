import { on } from 'svelte/events';

// ---------------- on

on(document.body, 'click', (e) => e.button);

on(
	document.body,
	'clidck',
	(e) =>
		// @ts-expect-error
		e.button
);

on(
	window,
	'click',
	(e) =>
		// @ts-expect-error ideally we'd know this is a MouseEvent here, too, but for keeping the types sane, we currently don't
		e.button
);

on(
	// @ts-expect-error
	'asd',
	'asd',
	(e) => e
);
