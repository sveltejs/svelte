<script>
	let data = '';

	if ($$slots.b) {
		data = 'foo';
	}

	export function getData() {
		return data;
	}

	function toString(data) {
		const result = {};
		const sortedKeys = Object.keys(data).sort();
		sortedKeys.forEach(key => result[key] = data[key]);
		return JSON.stringify(result);
	}
</script>

<svelte:options tag="custom-element"/>

<slot></slot>
<slot name="a"></slot>
<p>$$slots: {toString($$slots)}</p>
{#if $$slots.b}
	<div>
		<slot name="b"></slot>
	</div>
{:else}
	<p>Slot b is not available</p>
{/if}