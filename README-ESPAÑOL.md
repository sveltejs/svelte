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

Svelte es una nueva forma de crear aplicaciones web. Es un compilador que toma sus componentes declarativos y los convierte en JavaScript eficiente que actualiza quirúrgicamente el DOM.

Aprende mas en el sitio web de  [Svelte](https://svelte.dev), o pasa por la sala de chat de  [Discord](https://svelte.dev/chat).


## Apoya a Svelte


Svelte es un proyecto de código abierto con licencia tipo MIT cuyo desarrollo continuo es posible gracias al apoyo de voluntarios increíbles. Si desea apoyar sus esfuerzos, considere:


- [Conviertete en patrocinador de Open Collective](https://opencollective.com/svelte).

Los fondos donados a través de Open Collective se utilizarán para compensar los gastos relacionados con el desarrollo de Svelte, como los costos de alojamiento. Si se reciben suficientes donaciones, los fondos también pueden usarse para apoyar el desarrollo de Svelte de manera más directa.


## Desarrollo

Pull requests son bien recibidos. ¡[Elige un problema](https://github.com/sveltejs/svelte/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) y ayudanos!

Para instalar y trabajar con Svelte localmente:

```bash
git clone https://github.com/sveltejs/svelte.git
cd svelte
npm install
```

> No uses Yarn para instalr las dependencias, ya que las versiones especificadas en el `package-lock.json` son usadas para construir y probar Svelte.

Para construir el compilado, y todos los demás módulos incluidos en el paquete ejecuta:

```bash
npm run build
```

Para ver los cambios y reconstruir continuamente el paquete (esto es útil si está usando [npm link](https://docs.npmjs.com/cli/link.html) para probar los cambios en un proyecto localmente):


```bash
npm run dev
```

El compilador esta escrito en [TypeScript](https://www.typescriptlang.org/), pero no dejes que eso te desanime — basicamente solo es JavaScript con notaciones de tipo de dato. le agarraras la onda en poco tiempo. Si estas usando un editor que no sea [Visual Studio Code](https://code.visualstudio.com/) te sugerimos intalar un complemento para tener un resaltado de sintaxis, sugerencia de código, etcétera.


### Ejecutar pruebas

```bash
npm run test
```

Para filtrar las pruebas, utilice `-g` (mejor conocido como `--grep`). Por ejemplo, solo para ejecutar pruebas que involucren transiciones:

```bash
npm run test -- -g transicion
```


## svelte.dev

El código fuente de https://svelte.dev, incluida toda la documentación, se encuentra en el directorio de la [página](site). La página este construida con [Sapper](https://sapper.svelte.dev).

### ¿Svelte.dev está caído?

Probablemente no, pero es posible. si no puedes acceder a ningún sitio `.dev` , consulta [esta pregunta y respuesta de Super Usuario](https://superuser.com/q/1413402).

## licencia

[MIT](LICENSE)
