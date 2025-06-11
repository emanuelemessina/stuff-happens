const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/**
 * prepends the server base url, sets content to json, include credentials
 */
export function api(method, path, options = {}) {
	return fetch(`${SERVER_URL}/${path}`, {
		method: method,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		...options,
	});
}

// quick methods

export function post(path, body = {}, options = {}) {
	return api("POST", path, { body: JSON.stringify(body), ...options });
}

export function patch(path, body = {}, options = {}) {
	return api("PATCH", path, { body: JSON.stringify(body), ...options });
}

export function get(path, options = {}) {
	return api("GET", path, options);
}

export function del(path, options = {}) {
	return api("DELETE", path, options);
}

/**
 * parse json response and returns it if OK, otherwise throw it
 */
export async function parseResponse(response) {
	const data = await response.json();

	if (response.ok) {
		return data;
	}

	throw data;
}

// exports

import { logIn, logOut } from "./auth";
import { getLogged, getHistory } from "./user";
import { nextRound, start, submitRound } from "./game";

const API = { auth: { logIn, logOut }, user: { getLogged, getHistory }, game: { start, nextRound, submitRound } };
export default API;
