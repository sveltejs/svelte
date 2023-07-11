<svelte:options customElement="my-app" />

<script>
	export let prop = false;
	let innerVar = false;

	export function toggle() {
		innerVar = !innerVar;
		prop = !prop;
	}
</script>

<p>{prop} {innerVar}</p>
