<svelte:options customElement="custom-element" />

<script>
	export function updateFoo(value) {
		foo = value;
	}

	export let foo;
</script>

<p>{foo}</p>
