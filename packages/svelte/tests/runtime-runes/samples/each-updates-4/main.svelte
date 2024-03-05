<script>
	import { writable } from "svelte/store";

	const roomState = writable({
		users: {"gary": { name: "gary", value: 100 }},
	});
</script>

{#each Object.values($roomState.users) as user (user.name)}
	{user.value}
{/each}

<button onclick={() => $roomState.users["gary"].value = 1000}>Update</button>
