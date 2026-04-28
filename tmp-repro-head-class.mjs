import { compile } from './packages/svelte/src/compiler/index.js';

const source = `<svelte:head>
	<meta name="author" content={author} />
	<link rel="author" href={author_url} />
	<script type="application/ld+json"></script>
</svelte:head>

<div class="credits">Site by <a href={author_url}>{author}</a></div>

<script>
	let { author = 'Anonymous', author_url = 'https://example.com' } = $props();
</script>

<style>
</style>`;

const { js } = compile(source, { generate: 'server' });

console.log(js.code);
