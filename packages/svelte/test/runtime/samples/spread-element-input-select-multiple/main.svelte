<script>
  let value = ['Hello', 'World'];
  export let spread = {};
</script>

<select multiple {value} {...spread}>
  <option>Hello</option>
  <option>World</option>
</select>

<input type="checkbox" value="Hello" bind:group={value}>
<input type="checkbox" value="World" bind:group={value}>