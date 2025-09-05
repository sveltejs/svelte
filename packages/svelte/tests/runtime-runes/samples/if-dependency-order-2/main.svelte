<script>
	import Seo from './Seo.svelte';

	let post = $state(null);

	function toggle() {
		post = post ? null : { title: 'hello world' };
	}
</script>

<svelte:head>
	<title>initial</title>
</svelte:head>

<button onclick={toggle}>
	toggle
</button>

{#if post}
	<Seo {post} />
{/if}
