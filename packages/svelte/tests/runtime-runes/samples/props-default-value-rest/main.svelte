<script >
  import Inner from "./inner.svelte";

  let testProps = $state({
    color: "red"
  });
</script>

<button onclick={() => {
	testProps = {
		color: "blue"
	};
}}>set color</button>

<button onclick={() => {
	testProps = {
		color: "pink",
		options: 'baz'
	};
}}>set options</button>

<Inner {...testProps} />

<Inner color={testProps.color} />
