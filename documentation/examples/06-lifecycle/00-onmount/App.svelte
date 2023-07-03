<script>
	import { onMount } from 'svelte';

	let photos = [];

	onMount(async () => {
		const res = await fetch(`/tutorial/api/album`);
		photos = await res.json();
	});
</script>

<h1>Album photo</h1>

<div class="photos">
	{#each photos as photo}
		<figure>
			<img src={photo.thumbnailUrl} alt={photo.title} />
			<figcaption>{photo.title}</figcaption>
		</figure>
	{:else}
		<!-- ce bloc est affiché lorque photos.length === 0 -->
		<p>chargement...</p>
	{/each}
</div>

<style>
	.photos {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 8px;
	}

	figure,
	img {
		width: 100%;
		margin: 0;
	}
</style>
