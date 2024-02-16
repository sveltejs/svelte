<script>
	import { writable, } from 'svelte/store';

	const animate = writable();
</script>

<div in:$animate={{ duration: 750, x:0, y: -200}}>Hello!</div>
<div use:$animate>Hello!</div>
