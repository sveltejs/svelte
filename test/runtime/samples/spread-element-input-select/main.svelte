<script>
  export let value = 'World';
  export let spread = {};
</script>

<select {value} {...spread}>
  <option>Hello</option>
  <option>World</option>
</select>
