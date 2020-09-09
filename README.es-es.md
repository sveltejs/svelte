<p>
  <a href="https://svelte.dev">
	<img alt="Cybernetically enhanced web apps: Svelte" src="https://sveltejs.github.io/assets/banner.png">
  </a>

  <a href="https://www.npmjs.com/package/svelte">
    <img src="https://img.shields.io/npm/v/svelte.svg" alt="npm version">
  </a>

  <a href="https://github.com/sveltejs/svelte/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/svelte.svg" alt="license">
  </a>
</p>


## ¿Qué es Svelte?

Svelte es una nueva manera de crear aplicaciones web. Es un compilador que toma tus componentes declarativos y los convierte en JavaScript eficiente que actualiza el DOM de manera quirúrgica.

Puedes aprender más en la [web oficial de Svelte](https://svelte.dev), or pasarte por la [sala de chat de Discord](https://svelte.dev/chat).


## Apoyar a Svelte

Svelte es un proyecto _open-source_ con licencia del tipo _MIT-licensed_ cuyo continuo desarrollo es posible íntegramente por el apoyo de sus fantásticos voluntarios. Si deseas apoyar sus esfuerzos, por favor considera:

- [Convertirse en contribuidor en Open Collective](https://opencollective.com/svelte).

Los fondos donados por Open Collective serán usados para compensar los gastos relacionados al desarrollo de Svelte, como costos de estadía. En caso de haber donaciones suficientes, los fondos podrían también ser destinados para apoyar al desarrollo de Svelte directamente.


## Desarrollo

Las _Pull requests_ siempre son bienvenidas y alentadas. [¡Selecciona un _issue_](https://github.com/sveltejs/svelte/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) y ayúdanos!

Para instalar y trabajar con Svelte de manera local utiliza los siguientes scripts:

```bash
git clone https://github.com/sveltejs/svelte.git
cd svelte
npm install
```

> Se sugiere no utilizar _Yarn_ para instalar las dependencias, ya que algunas versiones son especificas en el `package-lock.json` se utilizan para preparar y probar Svelte.

Para preparar el compilador junto con otros módulos en el paquete utiliza el siguiente script:

```bash
npm run build
```

Para escuchar por cambios de manera continua y reconstruir el paquete (es especialmente útil si estás utilizando [npm link](https://docs.npmjs.com/cli/link.html) para probar cambios en el proyecto de manera local):

```bash
npm run dev
```

El compilador está escrito en [TypeScript](https://www.typescriptlang.org/), pero no dejes que esto te desanime — es básicamente JavaScript con tipos estáticos. Lo pillarás enseguida. Si utilizas algún otro editor además de [Visual Studio Code](https://code.visualstudio.com/) necesitaras instalar un plugin para tener resaltado de sintaxis y autocompletado etc.


### Ejecutar pruebas (Tests)

```bash
npm run test
```

Para filtrar las pruebas, utiliza `-g` (ó `--grep`). Por ejemplo, para solo ejecutar pruebas que solo involucren transiciones:

```bash
npm run test -- -g transition
```


## svelte.dev

El código fuente para https://svelte.dev, incluida toda su documentación, vive en el directorio [site](site). El _site_ está construido con [Sapper](https://sapper.svelte.dev).

### ¿Está caido svelte.dev?

Probablemente no, pero es posible. Si no puedes acceder ningún dominio `.dev` échale un ojo a [este post de preguntas y respuestas de SuperUser](https://superuser.com/q/1413402).

## Licencia

[MIT](LICENSE)
