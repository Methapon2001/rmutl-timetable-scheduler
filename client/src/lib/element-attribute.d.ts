declare namespace svelteHTML {
  interface HTMLAttributes {
    'on:outclick'?: (e: MouseEvent) => void;
    'on:enterViewport'?: () => void;
    'on:exitViewport'?: () => void;
  }
}
