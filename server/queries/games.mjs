import { db } from "#db";
import { DatabaseError } from "#errors";
import * as qRounds from "#queries/rounds";
import * as qCards from "#queries/cards";
import Round from "#entities/round";
import ENV from "#env";

/**
 * store the game and its rounds to db
 */
export async function save(user_id, rounds, won, cards) {
	const result = await db.run("INSERT INTO games (user_id, timestamp, won, rounds_num) VALUES (?, ?, ?, ?)", [
		user_id,
		Date.now(),
		won ? 1 : 0,
		rounds.length,
	]);
	const game_id = result.lastID;

	// Save initial cards as rounds with idx 0
	for (let i = 0; i < ENV.INITIAL_CARDS_COUNT; i++) {
		await qRounds.save(game_id, new Round(0, cards[i].id, null));
	}

	// Save actual rounds
	for (const round of rounds) {
		await qRounds.save(game_id, round);
	}
}

/**
 * return all game objs of the given user, ordered by descending timestamp
 */
export async function getAll(user_id) {
	const rows = await db.all("SELECT * FROM games WHERE user_id = ? ORDER BY timestamp DESC", user_id);
	const games = await Promise.all(
		rows.map(async (row) => {
			const rounds = await qRounds.getAll(row.id);
			return { ...row, rounds: rounds };
		})
	);
	return games;
}
