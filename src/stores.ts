import { writable, type Writable } from 'svelte/store';
import { type Indicator } from './types';

export const displayIndicator: Writable<Indicator> = writable('air_quality');
