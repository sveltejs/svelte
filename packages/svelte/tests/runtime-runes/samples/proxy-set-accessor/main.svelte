<script>
  let text = $state({
    value: 'svelte',
    get uppercase() {
      return this.value.toUpperCase()
    },
    set uppercase(v) {
      this.value = v.toLowerCase()
    }
  })
</script>

<input bind:value={text.uppercase} />
<p>{text.value}</p>
