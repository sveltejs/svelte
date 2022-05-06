<style>
  :host h1 {
    color: red;
  }

  :host > h1 {
    color: red;
  }

  :host > * {
    color: red;
	}

	:host span {
		color: red;
	}
		
	:host > span {
		color: red;
	}

  :host {
    color: red;
  }
</style>

<h1>Hello!</h1>

<div>
  <span>World!</span>
</div>
