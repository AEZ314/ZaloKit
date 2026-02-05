import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function getInitials(str) {
	return str
		.trim()
		.split(/\s+/)
		.map((word) => word[0])
		.join('')
		.toUpperCase();
}

export function firstName(name) {
	if (typeof name !== 'string') return '';
	const parts = name.trim().split(/\s+/);
	return parts[0] ?? '';
}
