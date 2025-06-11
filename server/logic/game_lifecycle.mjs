import openGames from "#logic/opengames";

export default class GameLifecycle {
	constructor(user_id, timeoutMinutes) {
		this.user_id = user_id;
		this.timeoutMinutes = timeoutMinutes;
		this.watchdog = null;
	}

	open(gameInstance) {
		openGames[this.user_id] = gameInstance;
		this.watchdog = setTimeout(() => {
			gameInstance.close();
		}, 1000 * 60 * this.timeoutMinutes);
	}

	close() {
		clearTimeout(this.watchdog);
		delete openGames[this.user_id];
		console.log(`Game for user ${this.user_id} closed.`);
		// garbage collector finishes the job
	}
}
