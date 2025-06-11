import { open } from "sqlite";
import sqlite3 from "sqlite3";
import fs from "fs/promises";

let db;

export { db };

/**
 * to be called when starting the server in index.mjs
 */
async function connect() {
	const dbPath = "storage/db/db.sqlite";
	try {
		db = await open({
			filename: dbPath,
			driver: sqlite3.Database,
		});
		console.log("Database connection successful");
	} catch (err) {
		throw `Couldn't connect to database at path ${dbPath}: ${err}`;
	}
}

async function disconnect() {
	if (!db) {
		return;
	}
	try {
		await db.close();
		console.log("Disconnected from database");
	} catch (err) {
		throw "Failed to disconnect to the database: " + error;
	}
}

export { connect, disconnect };
