export default {
	dev: true,

	warnings: [
		`Use component.on('destroy', ...) instead of component.on('teardown', ...) which has been deprecated and will be unsupported in Svelte 2`
	]
};