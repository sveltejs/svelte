<script lang="ts">
	let menuElement: HTMLUListElement | undefined = undefined;
	let left: number;
  let top: number;

  $: {
    if (menuElement) {
      const rect = menuElement.getBoundingClientRect();
      const menuHeight = 0;

      left = window.innerWidth - rect.width
      top = window.innerHeight - menuHeight;
    }
  }
</script>

<ul bind:this={menuElement}></ul>
