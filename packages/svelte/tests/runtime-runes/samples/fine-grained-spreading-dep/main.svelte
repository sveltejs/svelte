<script lang="ts">
	import Test from "./Test.svelte";
	let rest = $state({});
</script>

<button onclick={() => (rest = {})}>reset</button>
<button onclick={() => (rest = { foo: 1 })}>add foo</button>
<button onclick={() => (rest.foo = 1)}>update foo</button>
<button onclick={() => (rest.bar = 1)}>update bar</button>
<button onclick={() => (rest = { x: "else" })}>update rest</button>
<button onclick={() => (rest.x = "another")}>update x</button>

<Test x="something" {...rest}></Test>
