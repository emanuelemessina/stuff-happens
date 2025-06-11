export default class RoundManager {
	constructor(timeoutSeconds, graceSeconds) {
		this.pending_round = false;
		this.round_timeout = false;
		this.round_timer = null;
		this.timeoutSeconds = timeoutSeconds;
		this.graceSeconds = graceSeconds;
	}

	startRoundTimer() {
		this.pending_round = true;
		this.round_timeout = false;
		this.round_timer = setTimeout(() => {
			this.round_timeout = true;
		}, 1000 * (this.timeoutSeconds + this.graceSeconds));
	}

	stopRoundTimer() {
		clearTimeout(this.round_timer);
		this.pending_round = false;
	}

	isCorrect(prev, next, misfortune) {
		if (!(Number.isInteger(prev) && Number.isInteger(next))) {
			// client-side timeout
			this.round_timeout = true;
		}
		if (this.round_timeout) return false;
		return prev < misfortune && misfortune < next;
	}
}
