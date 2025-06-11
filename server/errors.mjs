/**
 * base class to throw an error to the client, with a code and a message
 *
 * errors not derived from this class
 * can send the stack and a specific message to the client
 * only if DEBUG is true
 *
 */
export class AppError {
	message;
	code;
	constructor(code, message) {
		this.message = message;
		this.code = code;
	}

	/**
	 * sends this error as an express json response
	 */
	send(res) {
		return res.status(this.code).json({ message: this.message, type: this.constructor.name });
	}
}

// semantic errors

export class ValidationError extends AppError {}

export class DatabaseError extends AppError {}

export class GameError extends AppError {}
