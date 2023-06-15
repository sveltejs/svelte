<script>
	/** @type {ImageToolsPictureData} */
	export let src;

	/** @type {string} */
	export let alt;

	export let lazy = false;
</script>

<picture>
	{#each Object.entries(src.sources) as [format, images]}
		<source srcset={images.map((i) => `${i.src} ${i.w}w`).join(', ')} type="image/{format}" />
	{/each}
	<img
		loading={lazy ? 'lazy' : 'eager'}
		height={src.img.h}
		width={src.img.w}
		src={src.img.src}
		{alt}
	/>
</picture>

<style>
	img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: cover;
	}
</style>
