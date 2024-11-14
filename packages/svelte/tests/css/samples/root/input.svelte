<style>
  :root {
    color: green;
  }
  .foo:root {
    color: green;
  }
  :root.foo {
    color: green;
  }
  :root.unknown {
    color: green;
  }

  :root h1 {
    color: green;
  }
  :root .unused {
    color: red;
  }

  :root:has(h1) {
    color: green;
  }
  :root:has(.unused) {
    color: red;
  }

  :root:not(.x) {
    color: green;
  }

  :root {
    h1 {
      color: green;
    }
    .unused {
      color: red;
    }
    :has(h1) {
      color: green;
    }
    :has(.unused) {
      color: red;
    }
    &:has(h1) {
      color: green;
    }
    &:has(.unused) {
      color: red;
    }
  }
</style>

<h1>Hello!</h1>
