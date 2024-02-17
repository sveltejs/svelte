<script>
	import Paragraph from './Paragraph.svelte';
	let boundParagraphs = $state([]);

	let store = $state([
		{ id: 1, text: 'b1' },
		{ id: 2, text: 'b2' }
	]);
</script>

{#each store as text, i (text.id)}
	<div>
		<Paragraph bind:this={boundParagraphs[i]} text={text.text}></Paragraph>
		<button onclick={() => boundParagraphs[i].changeBackgroundToRed()}>
			change
		</button>
		<button onclick={() => store.splice(store.indexOf(text), 1)}>
			delete
		</button>
	</div>
{/each}
