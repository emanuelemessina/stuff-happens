import dotenv from "dotenv";

dotenv.config();

const INITIAL_CARDS_COUNT = parseInt(process.env.INITIAL_CARDS_COUNT || "3", 10);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "default_secret";
const SERVER_PORT = parseInt(process.env.SERVER_PORT || "3001", 10);
const ROUND_TIMEOUT_SECONDS = parseInt(process.env.ROUND_TIMEOUT_SECONDS || "30", 10);
const ROUND_TIMEOUT_GRACE_SECONDS = parseInt(process.env.ROUND_TIMEOUT_GRACE_SECONDS || "10", 10);
const GAME_TIMEOUT_MINUTES = parseInt(process.env.GAME_TIMEOUT_MINUTES || "60", 10);
const DEBUG = process.env.DEBUG === "true";
const ANONYMOUS_ROUNDS = parseInt(process.env.ANONYMOUS_ROUNDS || "1", 10);
const LOGGED_ROUNDS = parseInt(process.env.LOGGED_ROUNDS || "3", 10);

/**
 * exports the variables parsed from .env
 */
const ENV = {
	COOKIE_SECRET,
	SERVER_PORT,
	CLIENT_URL,
	INITIAL_CARDS_COUNT,
	ROUND_TIMEOUT_SECONDS,
	ROUND_TIMEOUT_GRACE_SECONDS,
	GAME_TIMEOUT_MINUTES,
	DEBUG,
	ANONYMOUS_ROUNDS,
	LOGGED_ROUNDS,
};

export default ENV;
