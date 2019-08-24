class FancyButton extends HTMLButtonElement {}
customElements.define('fancy-button', FancyButton, { extends: 'button' });