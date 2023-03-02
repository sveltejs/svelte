class CustomButton extends HTMLButtonElement {}
customElements.define('custom-button', CustomButton, { extends: 'button' });
