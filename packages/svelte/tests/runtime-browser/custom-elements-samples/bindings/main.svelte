<svelte:options customElement="custom-element" />

<script lang="ts">
	import './my-counter.svelte';

	let count = $state(1);
	let items = $state<any[]>([]);
	let mode = $state<string>();
</script>

<my-counter bind:count bind:itemList={items} bind:mode></my-counter>
<button class="add-ten" onclick={() => (count += 10)}>add 10</button>
<button class="push" onclick={() => items.push('x')}>push</button>
<output>{count} {items.join(',')}</output>
<output class="mode">{mode}</output>
