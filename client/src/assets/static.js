const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/**
 * returns the static url for the resource under `path`
 */
export function staticUrl(path) {
	return `${SERVER_URL}/static/${path}`;
}

/**
 * returns the static url for the requested image
 */
export function image(name) {
	return staticUrl(`images/${name}.png`);
}
