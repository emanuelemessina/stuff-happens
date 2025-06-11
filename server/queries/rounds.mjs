import { db } from "#db";
import { DatabaseError } from "#errors";
import * as qCards from "#queries/cards";

/**
 * returns all rounds for the given game, ordered by round index, hiding the misfortune and image of each card
 */
export async function getAll(game_id) {
	const rows = await db.all("SELECT * from rounds WHERE game_id = ? ORDER BY idx", game_id);
	const rounds = await Promise.all(
		rows.map(async (row) => {
			let card = await qCards.getById(row.card_id);
			delete card.misfortune;
			delete card.img;
			return { ...row, card: card };
		})
	);
	return rounds;
}

export async function save(game_id, round) {
	await db.run("INSERT INTO rounds (game_id, idx, card_id, correct) VALUES (?, ?, ?, ?)", [
		game_id,
		round.idx,
		round.card_id,
		round.correct ? 1 : 0,
	]);
}
