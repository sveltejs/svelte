import * as eases from 'svelte/easing';

let processed_eases = {};

for (let ease in eases) {
  if (ease === "linear") {
    processed_eases.linear = eases.linear;
  } else {
    const name = ease.replace(/In$|InOut$|Out$/, '');
    const type = ease.match(/In$|InOut$|Out$/)[0];

    if (!processed_eases.hasOwnProperty(name)) processed_eases[name] = {};
    processed_eases[name][type] = {};
    processed_eases[name][type].fn = eases[ease];

    let shape = 'M0 1000'
    for (let i = 1; i <= 1000; i++) {
      shape = `${shape} L${(i / 1000) * 1000} ${1000 - eases[ease](i / 1000) * 1000} `;

      processed_eases[name][type].shape = shape;
    }
  }
}

let sorted_eases = new Map([
  ['sine', processed_eases.sine],
  ['quad', processed_eases.quad],
  ['cubic', processed_eases.cubic],
  ['quart', processed_eases.quart],
  ['quint', processed_eases.quint],
  ['expo', processed_eases.expo],
  ['circ', processed_eases.circ],
  ['back', processed_eases.back],
  ['elastic', processed_eases.elastic],
  ['bounce', processed_eases.bounce],
]);

export let types = [
  ['Ease In', 'In'],
  ['Ease Out', 'Out'],
  ['Ease In Out', 'InOut']
];

export { sorted_eases as eases };