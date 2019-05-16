function convertText (text, symbol) {
  return text
    .split(' ')
    .map(word => word && symbol)
    .join(' ')
}

export function convertable (node, { symbol, text }) {
  const tooltip = document.createElement('div')
  tooltip.textContent = convertText(text, symbol)

  Object.assign(tooltip.style, {
    position: 'absolute',
    background: 'black',
    color: 'white',
    padding: '0.5em 1em',
    fontSize: '15px',
    pointerEvents: 'none',
    transform: 'translate(5px, -50%)',
    borderRadius: '2px',
    transition: 'opacity 0.4s'
  })

  function position () {
    const { top, right, bottom, left } = node.getBoundingClientRect()
    tooltip.style.top = `${bottom + 35}px`
    tooltip.style.left = `${left}px`
  }

  function append () {
    document.body.appendChild(tooltip)
    tooltip.style.opacity = 0
    setTimeout(() => (tooltip.style.opacity = 1))
    position()
  }

  function remove () {
    tooltip.remove()
  }

  node.addEventListener('mouseenter', append)
  node.addEventListener('mouseleave', remove)

  return {
    destroy () {
      tooltip.remove()
      node.removeEventListener('mouseenter', append)
      node.removeEventListener('mouseleave', remove)
    }
  }
}
