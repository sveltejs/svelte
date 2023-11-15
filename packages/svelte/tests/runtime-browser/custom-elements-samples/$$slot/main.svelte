<svelte:options customElement="custom-element" />

<script>
	let data = "";

	if ($$slots.b) {
		data = "foo";
	}

	export function getData() {
		return data;
	}

	function toString(data) {
		const result = {};
		const sortedKeys = Object.keys(data).sort();
		sortedKeys.forEach((key) => (result[key] = data[key] ? true : false));
		return JSON.stringify(result);
	}
</script>

<slot />
<slot name="a" />
<p>$$slots: {toString($$slots)}</p>
{#if $$slots.b}
	<div>
		<slot name="b" />
	</div>
{:else}
	<p>Slot b is not available</p>
{/if}
