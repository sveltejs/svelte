<script>
	function toString(data) {
		const result = {};
		const sortedKeys = Object.keys(data).sort();
		sortedKeys.forEach(key => result[key] = data[key]);
		return JSON.stringify(result);
	}

  const slot_1 = 'a'.repeat(5);
  const slot_2 = 'ab'.repeat(2);
</script>

$$slots: {toString($$slots)}

{#if $$slots[slot_1]}
  <slot name={slot_1}></slot>
{:else}
  Slot aaaaa is not available
{/if}

{#if $$slots[slot_2]}
	<div>
		<slot name={slot_2}></slot>
	</div>
{:else}
	Slot abab is not available
{/if}
