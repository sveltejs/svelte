---
title: Actions
---


### Actions

Actions let you decorate elements with additional functionality. Actions are functions which may return an object with lifecycle methods, `update` and `destroy`. The action will be called when its element is added to the DOM.

Use actions for things like:

* tooltips
* lazy loading images as the page is scrolled, e.g. `<img use:lazyload data-src='giant-photo.jpg'/>`
* capturing link clicks for your client router
* adding drag and drop

```html
<!-- { title: 'Actions' } -->
<button on:click={toggleLanguage} use:tooltip={translations[language].tooltip}>
	{language}
</button>

<script>
	export default {
		actions: {
			tooltip(node, text) {
				const tooltip = document.createElement('div');
				tooltip.textContent = text;

				Object.assign(tooltip.style, {
					position: 'absolute',
					background: 'black',
					color: 'white',
					padding: '0.5em 1em',
					fontSize: '12px',
					pointerEvents: 'none',
					transform: 'translate(5px, -50%)',
					borderRadius: '2px',
					transition: 'opacity 0.4s'
				});

				function position() {
					const { top, right, bottom } = node.getBoundingClientRect();
					tooltip.style.top = `${(top + bottom) / 2}px`;
					tooltip.style.left = `${right}px`;
				}

				function append() {
					document.body.appendChild(tooltip);
					tooltip.style.opacity = 0;
					setTimeout(() => tooltip.style.opacity = 1);
					position();
				}

				function remove() {
					tooltip.remove();
				}

				node.addEventListener('mouseenter', append);
				node.addEventListener('mouseleave', remove);

				return {
					update(text) {
						tooltip.textContent = text;
						position();
					},

					destroy() {
						tooltip.remove();
						node.removeEventListener('mouseenter', append);
						node.removeEventListener('mouseleave', remove);
					}
				}
			}
		},

		methods: {
			toggleLanguage() {
				const { language } = this.get();

				this.set({
					language: language === 'english' ? 'latin' : 'english'
				});
			}
		}
	};
</script>
```

```json
/* { hidden: true } */
{
	language: "english",
	translations: {
		english: {
			tooltip: "Switch Languages",
		},
		latin: {
			tooltip: "Itchsway Anguageslay",
		},
	}
}
```