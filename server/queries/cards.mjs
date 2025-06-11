import { db } from "#db";
import { DatabaseError } from "#errors";
import ENV from "#env";

/**
 * returns the initial random cards, ordered by increasing misfortune
 */
export async function getStartingCards() {
	const rows = await db.all(`SELECT * FROM cards ORDER BY RANDOM() LIMIT ${ENV.INITIAL_CARDS_COUNT}`);

	if (!rows || rows.length < ENV.INITIAL_CARDS_COUNT) {
		throw new DatabaseError(409, `There are not enough cards in the database!`);
	}

	rows.sort((a, b) => a.misfortune - b.misfortune);
	return rows;
}

/**
 * returns a new random card not present in the given set
 */
export async function getNewExcluding(cards) {
	const excludedIds = cards.map((card) => card.id);
	const placeholders = excludedIds.map(() => "?").join(",");
	const query = `SELECT * FROM cards WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`;
	const row = await db.get(query, excludedIds);

	if (!row) {
		throw new DatabaseError(409, `No more new cards available!`);
	}

	return row;
}

export async function getById(id) {
	const row = await db.get("SELECT * FROM cards WHERE id = ?", id);

	if (row) {
		return row;
	} else {
		throw new DatabaseError(404, `Card with ID ${id} not found`);
	}
}
