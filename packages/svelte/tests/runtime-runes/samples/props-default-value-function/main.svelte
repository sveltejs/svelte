<script>
	import Wrapper1 from "./wrapper.svelte"
	import Wrapper2 from "./wrapper2.svelte"
	let count = $state(0);

	let getter = $derived.by(() => {
		const copy = count;
		return () => copy;
	});
</script>

<button onclick={() => count++}>inc</button>
<Wrapper1 {getter}/>
<Wrapper2 {getter}/>