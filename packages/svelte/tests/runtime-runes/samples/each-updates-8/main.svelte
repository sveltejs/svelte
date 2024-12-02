<script>
	let messages = $state([{id: 1, content: "message 1"}]);

	function add() {
		const newId = messages.length + 1
		messages.push({id: 0, tmpId: newId, content: `message ${newId}`})

		queueMicrotask(() => {
			const msg = messages.find((m) => m.tmpId === newId && m.id === 0)
			msg.tmpId = ""
			msg.id = newId
		})
	}
</script>

<button onclick={add}>Add new message</button>

{#each messages as msg, i (`${msg.id}_${msg.tmpId ?? ""}`)}
	{#if i === 0}
		<p>first</p>
	{/if}
	<p>{msg.content}</p>
{/each}
