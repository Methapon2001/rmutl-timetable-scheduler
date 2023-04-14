import { writable } from 'svelte/store';

export const session = writable<API.Session | null>(null);
