import crypto from "crypto";
import User from "#entities/user";
import { db } from "#db";
import { DatabaseError } from "#errors";

/**
 * returns false if credentials are wrong (as passport requires)
 */
export async function authenticate(username, password) {
	return new Promise((resolve, reject) => {
		db.get("SELECT * FROM users WHERE username = ?", username).then((row) => {
			if (!row) {
				resolve(false);
				return;
			}
			crypto.scrypt(password, row.salt, 32, (err, hash) => {
				if (err) {
					reject(err);
					return;
				}
				if (!crypto.timingSafeEqual(Buffer.from(row.hash, "hex"), hash)) {
					resolve(false);
					return;
				} else {
					resolve(new User(row.id, row.username));
					return;
				}
			});
		});
	});
}

export async function getById(id) {
	const row = await db.get("SELECT id, username FROM users WHERE id = ?", id);

	if (row) {
		return new User(row.id, row.username);
	} else {
		throw new DatabaseError(404, `User with ID ${id} not found`);
	}
}

export async function getByUsername(username) {
	const row = await db.get("SELECT id, username FROM users WHERE username = ?", username);

	if (row) {
		return new User(row.id, row.username);
	} else {
		throw new DatabaseError(404, `User with username ${username} not found`);
	}
}
