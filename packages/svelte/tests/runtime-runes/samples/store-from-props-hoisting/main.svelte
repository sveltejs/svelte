<script>
	import { writable } from "svelte/store";
	import Child from "./child.svelte";
	const attrs = writable({ count: 0 });
</script>

<Child {attrs} />