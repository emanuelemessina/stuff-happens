import { post, parseResponse, patch } from ".";

/**
 * sends a request to start a new game
 */
export async function start() {
	const response = await post("games");
	return await parseResponse(response);
}

export async function nextRound() {
	const response = await post("games/current/rounds");
	return await parseResponse(response);
}

/**
 * sends a request to start a new game
 */
export async function submitRound(prev = null, next = null) {
	const body =
		Number.isInteger(prev) && Number.isInteger(next)
			? {
					prev: prev,
					next: next,
			  }
			: {};
	const response = await post("games/current/rounds/pending", body);
	return await parseResponse(response);
}
