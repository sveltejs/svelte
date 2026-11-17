<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
	const todo = $state({ text: 'a' });
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => (todo.text += '!')}>edit</button>

<p>{count} {doubled} {todo.text}</p>
