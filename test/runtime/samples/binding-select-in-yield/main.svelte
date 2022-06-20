<script>
	import Modal from './Modal.svelte';

	export let modal;
	export let letter;
	export let letters = ['a', 'b', 'c'];
</script>

<Modal bind:this={modal}>
	<span>{letter}</span>
	<select bind:value={letter}>
		{#each letters as letter}
			<option value="{letter}">{letter}</option>
		{/each}
	</select>
</Modal>