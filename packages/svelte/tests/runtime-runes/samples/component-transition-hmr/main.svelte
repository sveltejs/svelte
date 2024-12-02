<script>
  import Red from "./Red.svelte"
  import Blue from "./Blue.svelte"
  const comps = {
    Red,
    Blue
  };
  let activeComp = $state("Red")
</script>

<main>
  <button onclick={() => activeComp = activeComp === "Red" ? "Blue" : "Red"}>toggle</button>
  <svelte:component this={comps[activeComp]} />
</main>
