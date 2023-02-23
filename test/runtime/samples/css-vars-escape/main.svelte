<script>
import Sub from './Sub.svelte';
  export let attack = '" onload="alert(\'uhoh\')" data-nothing="not important';
</script>

<Sub --color={attack} />
