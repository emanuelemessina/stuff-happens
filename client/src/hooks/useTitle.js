import { useEffect } from "react";

/**
 * sets the tab title on mount
 */
export default function useTitle(title, global = false) {
	useEffect(() => {
		document.title = `${title}${!global ? " | Stuff Happens" : ""}`;
	}, []);
}
