<script>
	import {s} from "./Component.svelte";
	import {onMount}from "svelte";

	let d2 = $derived(s.d1.filter(x => x > 2));
	let d3 = $derived(s.all.filter(x => x > 2));

	onMount(()=>{
		queueMicrotask(() => {
			s.update_value();
		});
	});
</script>

<div>d2: {d2.join(',')}</div>
<div>d3: {d3.join(',')}</div>
<div>d4: {d3.join(',')}</div>
