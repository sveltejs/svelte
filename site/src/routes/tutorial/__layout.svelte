<script context="module">
	export async function load({ fetch }) {
		const sections = await fetch(`/tutorial.json`).then(r => r.json());
		return {
			props: {
				sections
			}
		};
	}
</script>

<script>
	import { setContext } from 'svelte';

	export let sections;
	setContext('tutorial', { sections });
</script>

<slot></slot>
