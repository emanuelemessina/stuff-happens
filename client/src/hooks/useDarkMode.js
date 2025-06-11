import { useState, useEffect } from "react";

/**
 * dark mode state and persistence
 *
 * returns dark mode state and toggle method
 */
export default function useDarkMode() {
	const [darkMode, setDarkMode] = useState(() => {
		let savedMode = localStorage.getItem("darkMode");
		if (savedMode === null) {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			savedMode = prefersDark ? "true" : "false";
		}
		return savedMode === "true";
	});

	const updateDarkMode = (mode) => {
		if (mode) {
			document.documentElement.setAttribute("data-bs-theme", "dark");
			localStorage.setItem("darkMode", "true");
		} else {
			document.documentElement.removeAttribute("data-bs-theme");
			localStorage.setItem("darkMode", "false");
		}
	};

	useEffect(() => {
		updateDarkMode(darkMode);
	}, [darkMode]);

	const toggleDarkMode = () => setDarkMode((prevMode) => !prevMode);

	return [darkMode, toggleDarkMode];
}
