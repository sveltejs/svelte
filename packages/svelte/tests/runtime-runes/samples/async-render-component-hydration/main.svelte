<script lang="ts">
	import Image from "./Image.svelte";
	import Link from "./Link.svelte";

	let url = $derived(await 'https://svelte.dev');
</script>

<Link>
	<div>card</div>
	<Image src={url} />
</Link>
