import { useState, useEffect, useRef } from "react";

/**
 * countdown timer
 *
 * it will start in the halted state\
 * can be started by calling the restart function
 *
 * @returns countdown state, halt and restart function
 */
export default function useCountdown(count, onTimeout) {
	const [secondsLeft, setSecondsLeft] = useState(-1);
	const intervalRef = useRef(null);

	useEffect(() => {
		if (secondsLeft == -1) return; // halt

		if (secondsLeft > 0) {
			intervalRef.current = setTimeout(() => {
				setSecondsLeft((prev) => prev - 1);
			}, 1000);
		} else {
			clearTimeout(intervalRef.current);
			onTimeout();
		}

		return () => clearTimeout(intervalRef.current); // cleanup
	}, [secondsLeft]);

	return [secondsLeft, () => setSecondsLeft(-1), () => setSecondsLeft(count)];
}
