<script lang="ts">
	import { writable } from 'svelte/store';
	let menu = ['Cookies and cream', 'Mint choc chip', 'Raspberry ripple'];
	let order = writable({ iceCream: [{flavours: ['Mint choc chip']}], scoops: 1 });
	let index = 0
</script>

<form method="POST">
	<input type="radio" bind:group={$order.scoops} name="scoops" value={1} /> One scoop
	<input type="radio" bind:group={$order.scoops} name="scoops" value={2} /> Two scoops
	<input type="radio" bind:group={$order.scoops} name="scoops" value={3} /> Three scoops

	{#each menu as flavour}
		<input type="checkbox" bind:group={$order.iceCream[index].flavours} name="flavours" value={flavour} /> {flavour}
	{/each}
</form>

<div id="output">{$order.iceCream[index].flavours.join('+')}</div>
