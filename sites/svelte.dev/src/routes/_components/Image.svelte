<script>
	/** @type {any} */
	export let src;

	/** @type {string} */
	export let alt;

	console.log(src);
</script>

<picture>
	{#each Object.entries(src?.sources ?? {}) as [format, images]}
		<source srcset={images?.map((i) => `${i?.src} ${i?.w}w`).join(', ')} type="image/{format}" />
	{/each}
	<img height={src.img.h} width={src.img.w} src={src?.img?.src} {alt} />
</picture>

<style>
	img {
		display: block;
		width: 100%;
		height: auto;
		max-height: var(--max-height, 100%);
		object-fit: cover;
	}
</style>
