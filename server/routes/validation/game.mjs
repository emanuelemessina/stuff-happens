import openGames from "#logic/opengames";
import { ValidationError } from "#errors";

/**
 * enforces an openGame cookie
 *
 * if a game is found, it sets req.openGame
 */
export const hasOpenGame = (req, res, next) => {
	let raw = req.signedCookies.openGame;
	if (!raw) {
		return new ValidationError(400, "This user does not have an open game").send(res);
	}
	let cookie = JSON.parse(raw);
	req.openGame = openGames[cookie.id];
	if (!req.openGame) {
		res.clearCookie("openGame");
		return new ValidationError(400, "The requested game is already over").send(res);
	}
	return next();
};
