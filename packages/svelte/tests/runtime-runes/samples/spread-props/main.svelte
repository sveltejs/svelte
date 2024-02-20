<script>
	import Button from "./Button.svelte";

	const attrs = {};

	Object.defineProperty(attrs, "data-attr", {
		value: "",
		enumerable: true
	});
</script>

<button {...attrs}>
	Hello world
</button>

<Button {...attrs} />
