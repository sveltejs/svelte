<script>
  class Model {
    data = $state();

    constructor(data) {
      this.data = data;
    }

    name = $derived(this.data?.name);
    source = $derived(this.data?.source);

    toggle() {
      this.data.name = this.data.name === 'zeeba' ? 'neighba' : 'zeeba';
    }
  }

	let model = $state(new Model({ name: 'zeeba', source: 'initial' }));

  let setModel = (source) => {
		let next = new Model({ name: 'zeeba', source });
		model = next;
  }

  let needsSet = $state(false);

  $effect(() => {
    if(needsSet) {
      setModel('effect');
      needsSet = false;
    }
  });

  let setWithEffect = () => {
    needsSet = true;
  };

  let toggle = () => {
    model.toggle();
  }
</script>

<button onclick={setWithEffect}>Activate</button>
<button onclick={toggle}>Toggle</button>
{model.name}
{model.data.name}
