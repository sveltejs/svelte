<script>
  import LabelComponent from './label.svelte'
</script>

<label>A</label>
<label for="id">B</label>

<label>C <input type="text" /></label>
<label>D <button>D</button></label>
<label>E <span></span></label>
<label>F {#if true}<input type="text" />{/if}</label>
<LabelComponent>G <input type="text" /></LabelComponent>
