import type { Info } from './types';
import { writable } from 'svelte/store';

export const info = writable<Info | undefined>(undefined);
