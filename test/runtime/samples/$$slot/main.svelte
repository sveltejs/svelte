<script>
	import A from "./A.svelte";
	let a, b;

	export function getA() {
		return a.getData();
	}
	export function getB() {
		return b.getData();
	}
</script>

<A bind:this={a}>
  <span slot="a">hello world</span>
  <span>bye</span>
  <span>world</span>
</A>

<A bind:this={b}>
  <span slot="a">hello world</span>
  <span slot="b">hello world</span>
  <span>bye world</span>
</A>
