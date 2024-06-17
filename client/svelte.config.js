import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [sveltekit(), sveltePreprocess({ postcss: true })],

  kit: { adapter: adapter() },
};

export default config;
