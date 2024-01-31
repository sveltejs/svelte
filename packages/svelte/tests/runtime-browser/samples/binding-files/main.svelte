<script>
	import { onMount } from "svelte";

  let files;

  onMount(() => {
		let list = new DataTransfer();
		let file = new File(["content"], "filename.jpg");
		list.items.add(file);
		files = list.files;
	})
</script>

<input type="file" bind:files />

<button onclick={() => files = new DataTransfer().files}>Reset</button>
