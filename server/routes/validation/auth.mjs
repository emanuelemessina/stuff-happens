import { ValidationError } from "#errors";

export const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	return new ValidationError(401, "Unauthorized").send(res);
};
