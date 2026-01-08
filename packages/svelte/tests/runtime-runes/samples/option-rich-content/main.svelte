<script>
	import InnerA from './InnerA.svelte';
	import InnerB from './InnerB.svelte';

	let selected = $state('a');
	let label_a = $state('Option');
	let label_b = $state('Strong');
</script>

<select bind:value={selected}>
	<option value="a"><InnerA label={label_a} /></option>
	<option value="b"><InnerB label={label_b} /></option>
	<option value="c">Plain C</option>
</select>

<p>Selected: {selected}</p>

<button onclick={() => label_a = 'Changed'}>Change A</button>
