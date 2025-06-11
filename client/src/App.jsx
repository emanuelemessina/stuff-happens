import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import { AlertContext, UserContext } from "@context";
import { LoginForm } from "@components/Login";
import NotFound from "@components/NotFound";
import Instructions from "@components/Instructions";
import History from "@components/History";
import DefaultLayout from "@components/DefaultLayout";
import Game from "@components/Game";
import API from "@api";

export default function App() {
	// App holds the auth state and context
	const [user, setUser] = useState(null);

	// App holds the global alert state and context
	// there is only one alert consumer and multiple setAlert producers
	const [alert, _setAlert] = useState({ message: "", type: "" });

	function setAlert(message, type) {
		_setAlert({ message: message, type: type });
	}

	// perform the login check at app mount
	useEffect(() => {
		async function checkAuth() {
			try {
				const user = await API.user.getLogged();
				setUser(user);
			} catch (err) {
				// unauthorized
				// do nothing, it was just to check
			}
		}

		checkAuth();
	}, []);

	/**
	 * perform the login request with the given credentials, always resolves
	 *
	 * handles state and ui message
	 *
	 * on failure, it returns an error object to the caller
	 */
	async function performLogin(credentials) {
		try {
			const user = await API.auth.logIn(credentials);
			setUser(user);
			console.log(`User ${user.username} logged in`);
			setAlert(`Welcome, ${user.username}!`, "success");
			return null;
		} catch (err) {
			console.log("Login failed: ", err);
			return { type: "error", message: err.message };
		}
	}

	async function performLogout() {
		await API.auth.logOut();
		setUser(null);
		console.log(`User logged out`);
	}

	return (
		<UserContext.Provider value={user}>
			<AlertContext.Provider value={setAlert}>
				<Routes>
					{/* layout route (always matched, wraps every other)
					provides header, message, and logout
				*/}
					<Route element={<DefaultLayout performLogout={performLogout} alert={alert} />}>
						{/* child routes */}

						{/* home (instructions) */}
						<Route path="/" element={<Instructions />} />
						{/* login page */}
						<Route
							path="/login"
							element={user ? <Navigate replace to="/" /> : <LoginForm performLogin={performLogin} />}
						/>
						{/* user page (take back to home if not logged in) */}
						<Route path="/user/history" element={user ? <History /> : <Navigate replace to="/" />} />
						{/* game */}
						<Route path="/game" element={<Game />} />

						{/* not found */}
						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</AlertContext.Provider>
		</UserContext.Provider>
	);
}
