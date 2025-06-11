import express from "express";
import { query, body, validationResult, matchedData, param } from "express-validator";
import { handleValidationErrors } from "#index";

const router = express.Router();

import OpenGame from "#logic/open_game";
import openGames from "#logic/opengames";
import { hasOpenGame } from "#validation/game";

// start a new game
router.post("/", async (req, res, next) => {
	// no concurrent games allowed
	if (req.signedCookies.openGame) {
		let cookie = JSON.parse(req.signedCookies.openGame);
		let openGame = openGames[cookie.id];
		// cookie may be obsolete
		if (openGame) {
			// close the current game to start a new one
			openGame.close();
		}
		// finally remove the cookie
		res.clearCookie("openGame");
	}

	// check anonymous
	let user_id = null;
	let anonymous = true;
	if (req.isAuthenticated()) {
		user_id = req.user.id;
		anonymous = false;
	} else {
		// generate fake user id
		user_id = Math.floor(Math.random() * 0xffffff)
			.toString(16)
			.padStart(6, "0");
	}

	// create a new game
	try {
		const game = new OpenGame(user_id, anonymous);
		await game.open();
		// set the opengame index cookie
		res.cookie("openGame", JSON.stringify({ id: user_id }), {
			signed: true,
		});
		// give the first three cards
		res.json({ cards: game.cards });
	} catch (err) {
		return next(err);
	}
});

// request a new round for the current game
router.post("/current/rounds", hasOpenGame, async (req, res, next) => {
	let game = req.openGame;
	try {
		const response = await game.nextRound();
		res.json(response);
	} catch (err) {
		return next(err);
	}
});

// send the round choice
// requires prev and next card misfortunes to tell if choice if correct or not
// saves the game if this is the last round
// returns the current status after submission
router.post(
	"/current/rounds/pending",
	[body("prev").optional().isNumeric(), body("next").optional().isNumeric()],
	handleValidationErrors,
	hasOpenGame,
	async (req, res, next) => {
		try {
			const response = await req.openGame.saveRound(req.body.prev, req.body.next);
			if (response.status.game_over) {
				// remove game cookie
				res.clearCookie("openGame");
			}
			res.json(response);
		} catch (err) {
			return next(err);
		}
	}
);

export default router;
