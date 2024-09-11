// Note that custom element names must be unique across tests that can be run at the same time. So we use a verbose element name instead of just `<custom-element>`
customElements.define("custom-element-with-settable-only-property", class CustomElement extends HTMLElement {
  set prop(n) {
    this.value = n;
  }

  get prop() {
    throw new Error("This value is not gettable");
  }
});
