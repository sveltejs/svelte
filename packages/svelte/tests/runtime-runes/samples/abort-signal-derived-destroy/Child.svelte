<script lang="ts">
	import { getAbortSignal } from "svelte";

	let { count, aborted = $bindable() } = $props()

	let der = $derived.by(()=>{
		const signal = getAbortSignal();

		signal.addEventListener("abort", () => {
			try {
				aborted++;
			} catch(e) {
				console.error(e);
			}
		});
		return count;
	})
</script>

{der}
