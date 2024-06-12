<script>
  import { on } from "svelte/events";

  function handleParentKeyDown() {
    console.log("parent keydown");
  }
  function keydownOne(node) {
    on(node, "keydown", (e) => {});
  }
  function keydownTwo(node) {
    on(node, "keydown", (e) => {});
  }
  function keydownThree(node) {
    on(node, "keydown", (e) => {});
  }
</script>

<div onkeydown={handleParentKeyDown}>
  <button use:keydownOne use:keydownTwo use:keydownThree>button</button>
</div>
