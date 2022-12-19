<script>
	import { writable } from "svelte/store";
	import Tab from "./Tab.svelte";

	let i = 0;
	const { set, subscribe } = writable({ id: 1, name: "tab1" });
	const tab = {
		set(value) {
			i++;
			set(value);
		},
		subscribe,
	};
</script>

<Tab bind:tab={$tab} />
<p>{i}</p>
