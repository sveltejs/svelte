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
}}>change</button>

<Inner {...testProps} />

<Inner color={testProps.color} />
