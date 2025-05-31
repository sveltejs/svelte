<script>
	import { createAttachmentKey } from "svelte/attachments";

	let count = $state(0);

	const attachment = () => {
			console.log("up");
			return () => {
				console.log("down");
			}
		}
	
	const props = $derived({
		'data-count': count,
		[createAttachmentKey()]: attachment
	});
</script>

<p {...props}></p>

<button onclick={() => count++}>{count}</button>