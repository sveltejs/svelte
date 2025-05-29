<script>
	class X {
    x = $state(1);
    on_class = $derived(this.x * 2);
    #on_class_private = $derived(this.x * 2);
    #in_constructor_private

    constructor() {
      this.#in_constructor_private = $derived(this.x * 2);
      this.in_constructor = $derived(this.x * 2);
      this.#on_class_private = 3;
      this.#in_constructor_private = 3;
    }

    get on_class_private() {
      return this.#on_class_private;
    }

    get in_constructor_private() {
      return this.#in_constructor_private;
    }
  }

  const x = new X();
  x.on_class = 3;
  x.in_constructor = 3;
</script>

{x.on_class} {x.in_constructor} {x.on_class_private} {x.in_constructor_private}
