<script lang="ts">
	import { getAbortSignal } from "svelte";

	let aborted = $state(0);

	let count = $state(0);

	let der = $derived.by(()=>{
		const signal = getAbortSignal();

		signal.addEventListener("abort", () => {
			try{
				aborted++;
			}catch(e){
				console.error(e);
			}
		});
		return count;
	})
</script>

{der}

<button onclick={() => count++}></button>