<script lang="ts">
	import { setContext } from "svelte";
	import B from "./B.svelte";

	let greeting = 'hello';
	setContext("greeting", greeting);

	await Promise.resolve();

	let recipient = 'world';
</script>

<B {recipient} />
