<script>
	import { Warp } from 'svelte';

	const warp = new Warp('app');
	warp.set('key', Promise.resolve({ fn: () => {} }));
</script>
