<script>
	let tag = $state('path');
	let xmlns = $state('http://www.w3.org/2000/svg');
</script>

<button onclick={() => {
	tag = 'div';
	xmlns = null;
}}>change</button>

<!-- wrapper necessary or else jsdom says this is always an xhtml namespace -->
<svg>
	<svelte:element this={tag} xmlns={xmlns} />
</svg>
