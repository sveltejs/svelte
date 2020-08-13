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

<slot></slot>
<slot name="a"></slot>

$$slots: {toString($$slots)}

{#if $$slots.b}
	<div>
		<slot name="b"></slot>
	</div>
{:else}
	Slot b is not available
{/if}