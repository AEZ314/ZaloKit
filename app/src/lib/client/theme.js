import { PersistedState } from 'runed';

export const themes = ['dark', 'light', 'soft'];
export const theme = new PersistedState('theme', 'dark');

export function cycleTheme() {
	theme.current = themes[(themes.indexOf(theme.current) + 1) % themes.length];
	document.documentElement.classList.remove('light', 'dark', 'soft');
	document.documentElement.classList.add(theme.current);
}
