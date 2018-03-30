export default {
	dev: true,

	warnings: [
		`Return 'destroy()' from custom event handlers. Returning 'teardown()' has been deprecated and will be unsupported in Svelte 2`
	]
};