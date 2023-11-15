<script>
	import { fly } from 'svelte/transition';

	let visible = true;
	let status = 'en attente...';
</script>

<p>statut: {status}</p>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<p
		transition:fly={{ y: 200, duration: 2000 }}
		on:introstart={() => (status = `début de l'entrée`)}
		on:outrostart={() => (status = 'début de la sortie')}
		on:introend={() => (status = `fin de l'entrée`)}
		on:outroend={() => (status = `fin de la sortie`)}
	>
		Entre et sort en volant
	</p>
{/if}
