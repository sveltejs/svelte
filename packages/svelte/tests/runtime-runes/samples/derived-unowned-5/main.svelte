<script context="module">
  export class Thing {
    data = $state();

    subscribe() {
      queueMicrotask(() => {
        this.data = {
          name: `Zeeba Neighba`,
        };
      });
    }

    name = $derived(this.data?.name);
  }

  export class Things {
    thing = $state();

    subscribe() {
      queueMicrotask(() => {
        this.thing = new Thing();
        this.thing.subscribe();
        this.thing.name;
      });
    }
  }
</script>

<script>
  let model = new Things();
  $effect(() => model.subscribe());
</script>

<div>{model.thing?.name}</div>
