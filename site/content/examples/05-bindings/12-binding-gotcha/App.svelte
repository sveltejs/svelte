<script>
	const items = [{ name: 'A', val: 1 }, { name: 'B', val: 2 }];
	const selected = {...items[0]};

	function change() {
		items.forEach(item => {
			if (item.name === selected.name) {
				selected.val = item.val;
			}
		});
	}
</script>

<h3>Order between <code>bind:</code> and <code>on:</code> matters</h3>

<p>if you add an event handler and bind a property, they will be executed in the order you write them in the template.</p>

<h4>✅ Binding first</h4>
<select
	bind:value={selected.name}
	on:change={change}

>
	{#each items as item}
		<option value={item.name}>{item.val}</option>
	{/each}
</select>

<p><span class="ok">This dropdown works as expected</span> because <code>bind:value</code> is before <code>on:change</code> so that your change handler sees the updated bound value.</p>

<h4>❗️ Event handler first</h4>
<select
	on:change={change}
  bind:value={selected.name}
>
	{#each items as item}
		<option value={item.name}>{item.val}</option>
	{/each}
</select>

<p><span class="gotcha">This dropdown won't work</span> (*) because by placing the <code>on:change</code> before the <code>bind:value</code> your event handler gets attached (and called) before the internal event handler added by <code>bind:value</code>.</p>

<p class="note">(*) On Firefox both the dropdown and the selected value the won't update. On Chrome, the dropdown updates but the selected value won't.</p>

<h4>Selected value</h4>
<input bind:value={selected.val}>

<style>
	p {
		line-height: 1.5rem
	}

	code {
		background-color: lavender;
		padding: 0.2rem;
		font-size: 1.1rem;
	}

	.note {
		font-style: italic;
		font-size: 0.8rem;
	}
</style>
