<script lang="ts">
  import { run } from 'svelte/legacy';

	let menuElement: HTMLUListElement | undefined = $state(undefined);
	let left: number = $state();
  let top: number = $state();

  run(() => {
    if (menuElement) {
      const rect = menuElement.getBoundingClientRect();
      const menuHeight = 0;

      left = window.innerWidth - rect.width
      top = window.innerHeight - menuHeight;
    }
  });
</script>

<ul bind:this={menuElement}></ul>