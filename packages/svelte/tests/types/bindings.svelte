<script lang="ts">
  let focused = $state(false);
</script>

<input bind:focused={focused} type="text" />
<textarea bind:focused={focused}></textarea>
<select bind:focused={focused}></select>
<div bind:focused={focused}></div>
