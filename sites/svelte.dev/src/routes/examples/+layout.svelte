<script>
	import { setContext } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	setContext('examples', { sections: data.examples });
</script>

<slot />
