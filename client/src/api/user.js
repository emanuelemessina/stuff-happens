import { get, parseResponse } from ".";

/**
 * requests the logged user object
 */
export async function getLogged() {
	const response = await get("user", {
		credentials: "include",
	});
	return await parseResponse(response);
}

/**
 * requests the logged user game history
 */
export async function getHistory() {
	const response = await get("user/history");
	return await parseResponse(response);
}
