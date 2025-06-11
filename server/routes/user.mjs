import express from "express";
import { query, body, validationResult, matchedData, param } from "express-validator";
import { handleValidationErrors } from "#index";
import { isLoggedIn } from "#validation/auth";

const router = express.Router();

import * as qGames from "#queries/games";

router.get("/", isLoggedIn, (req, res, next) => {
	res.json(req.user);
});

router.get("/history", isLoggedIn, async (req, res, next) => {
	try {
		const games = await qGames.getAll(req.user.id);
		res.json(games);
	} catch (error) {
		return next(error);
	}
});

export default router;
