import { writable } from 'svelte/store';

export const info = writable<API.Info | undefined>(undefined);
