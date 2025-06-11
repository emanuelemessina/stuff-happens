// imports
import express from "express";
import { query, body, validationResult, matchedData, param } from "express-validator";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as DB from "#db";
import { AppError, DatabaseError, ValidationError } from "#errors";
import ENV from "#env";

/////////////////////////////
// init express
/////////////////////////////

if (ENV.DEBUG) {
	console.log("DEBUG mode");
}

const app = new express();
const port = ENV.SERVER_PORT;

// morgan dev requests log formatting
app.use(morgan("dev"));

// json middleware: parse incoming requests as application/json
app.use(express.json());

// allow cors for frontend
app.use(
	cors({
		origin: ENV.CLIENT_URL, // frontend addr
		optionSuccessStatus: 200,
		credentials: true, // forward cookies
	})
);

/**
 * Middleware to handle validation errors from express-validator.
 * If validation errors exist, responds with a 400 status and the errors.
 * Otherwise, proceeds to the next middleware.
 *
 * use it as the last middleware of a route declaration after the param checkers, before auth validation
 */
export function handleValidationErrors(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return new ValidationError(400, errors.array()).send(res);
	}
	return next();
}

/////////////////////////////
// authentication
/////////////////////////////

// local strategy: auth via username and password

import * as qUsers from "#queries/users";

passport.use(
	new LocalStrategy(async function verify(username, password, callback) {
		try {
			const user = await qUsers.authenticate(username, password);
			// user can be false, in which case strategy fails
			// msg put in WWW-Authenticate
			return callback(null, user, "Wrong username or password");
		} catch (err) {
			// server error
			return callback(err);
		}
	})
);

// serialize user obj to session
passport.serializeUser(function (user, callback) {
	let session = user; // small and not sensitive, we can save it whole
	callback(null, session);
});
// deserialize session to user obj
passport.deserializeUser(function (session, callback) {
	let user = session; // matches serializeUser
	return callback(null, user);
});

// session storage
app.use(
	session({
		secret: ENV.COOKIE_SECRET, // sign session cookie
		resave: false, // don't save session to store if not changed
		saveUninitialized: false, // don't save new (not modified) session
	}) // default store: memory
);

// authenticate the session
app.use(passport.session());

////////////////
// cookies
/////////////////

app.use(
	cookieParser(ENV.COOKIE_SECRET, {
		httpOnly: true,
		maxAge: 60 * 60, // 1 hour
	})
);

////////////////
// routes
////////////////

/**
 * route handler structure:
 *
 * router.method(/route, checkers..., handleValidationErrors, auth,
 * 		async (req, res, next) => {
 * 			...
 * 			query
 * 			.then((...) => { res.json(...) })
 * 			.catch(next);
 * 		}
 * );
 *
 * this way query can be a simple promise that just return and throw, without resolve and reject clutter
 */

// root

app.get("/", (req, res) => {
	res.json({ message: "STUFF HAPPENS" });
});

// static

app.use("/static", express.static("storage/public"));

// auth

// login
app.post(
	"/sessions",
	body("username").isString().notEmpty(),
	body("password").isString().notEmpty(),
	handleValidationErrors,
	passport.authenticate("local"), // auth errors have different responses than validation
	(req, res, next) => {
		return res.status(200).json(req.user); // on success, it provides req.user
	}
);

// logout
app.delete("/sessions/current", (req, res) => {
	// exposed by passport
	req.logout(() => {
		return res.status(204).end();
	});
});

// user

import rUser from "#routes/user";

app.use("/user", rUser);

// games

import rGames from "#routes/games";

app.use("/games", rGames);

///////////////////////////////
// activate the server
//////////////////////////////

app.listen(port, () => {
	DB.connect()
		.then(() => {
			console.log(`Server listening at http://localhost:${port}`);
		})
		.catch((err) => {
			console.error(err);
			return;
		});
});

//////////////////////////////
// app error handler (last)
//////////////////////////////

app.use((err, req, res, next) => {
	if (err instanceof AppError) {
		err.send(res);
	} else {
		const response = { type: "Error", message: "Internal server error" };
		if (ENV.DEBUG) {
			response.message = err.message;
			response.stack = err.stack;
		}
		res.status(500).json(response);
	}
});

DB.disconnect();
