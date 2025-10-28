<script>
	import Seo from './Seo.svelte';

	let post = $state(null);

	function toggle() {
		post = post ? null : { title: 'hello world' };
	}
</script>

<button onclick={toggle}>
	toggle
</button>

{#switch !!post case true}
	<Seo {post} />
{/switch}
