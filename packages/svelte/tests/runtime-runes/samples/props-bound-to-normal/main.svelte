<script>
	import Inner from "./Inner.svelte";

	let bar = $state(0)
	let foo = {
		get bar () {
			return bar;
		},
		set bar(v) {
			bar = v;
		}
	}
</script>

<button on:click={() => bar++}>{foo.bar}</button>
<Inner bind:bar={foo.bar}/>
<Inner bar={foo.bar}/>
