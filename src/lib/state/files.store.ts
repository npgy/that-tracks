import { writable, type Writable } from 'svelte/store';

export const filesStore: Writable<File[]> = writable([]);
