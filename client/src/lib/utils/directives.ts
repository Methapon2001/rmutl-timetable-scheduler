export function clickOutside(node: HTMLElement) {
  const handleClick = (event: MouseEvent) => {
    if (!node.contains(event.target as HTMLElement)) {
      node.dispatchEvent(new CustomEvent('outclick'));
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
}

export function blurOnEscape(node: HTMLElement) {
  const handleKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && node && typeof node.blur === 'function') node.blur();
  };

  node.addEventListener('keydown', handleKey);

  return {
    destroy() {
      node.removeEventListener('keydown', handleKey);
    },
  };
}
