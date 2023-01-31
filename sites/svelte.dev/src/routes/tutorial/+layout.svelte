<script>
	import { setContext } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	setContext('tutorial', { sections: data.tutorials });
</script>

<slot />
