<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	function getURlToRedirectTo() {
		const section = data.sections.find((val) =>
			$page.url.hash.replace('#', '').startsWith(val.path.split('/').at(-1))
		);

		if (!section) return '/docs/introduction';

		// Remove the section name from hash, then redirect to that
		const hash = $page.url.hash.replace(`#${section.path.split('/').at(-1)}-`, '');

		return `${section.path}#${hash}`;
	}

	onMount(() => {
		goto(getURlToRedirectTo(), { replaceState: true });
	});
</script>
