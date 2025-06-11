import { parseResponse, del, post } from ".";

/**
 * performs logout for the currently logged user
 */
export async function logOut() {
	const response = await del("sessions/current");
	if (response.ok) return null;
}

/**
 * perform login with the given credentials, return user object if successful, throws otherwise
 */
export async function logIn(credentials) {
	const response = await post("sessions", credentials);
	if (response.status == 401) {
		// passport sets the server message in WWW-Authenticate, not readable
		// so i just rewrite it here
		throw { message: "Wrong username or password" };
	}
	return await parseResponse(response);
}
