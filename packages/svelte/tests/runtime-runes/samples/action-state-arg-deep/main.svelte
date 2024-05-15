<script>
  import Task from "./Task.svelte"

  let task = $state({ text: "initial" })
</script>

<Task prop={task} />

<button onclick={() => {
  task = { text: "updated" }
}}>
  Update prop
</button>
