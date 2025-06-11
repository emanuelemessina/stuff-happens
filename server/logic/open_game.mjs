import * as qCards from "#queries/cards";
import * as qGames from "#queries/games";
import Round from "#entities/round";
import { GameError } from "#errors";
import ENV from "#env";
import GameLifecycle from "#logic/game_lifecycle"
import RoundManager from "#logic/round_manager";

export default class OpenGame {
	/**
	 * if anonymous, a fake but unique user_id must be provided
	 */
	constructor(user_id, anonymous) {
		this.user_id = user_id;
		this.anonymous = anonymous;

		this.cards = []; // played cards, including failed ones
		this.rounds = []; // played rounds

		this.lifecycle = new GameLifecycle(user_id, ENV.GAME_TIMEOUT_MINUTES);
		this.roundManager = new RoundManager(ENV.ROUND_TIMEOUT_SECONDS, ENV.ROUND_TIMEOUT_GRACE_SECONDS);

		this.game_over = false;
		this.fails_left = anonymous ? ENV.ANONYMOUS_ROUNDS : ENV.LOGGED_ROUNDS;
		this.successes_left = anonymous ? ENV.ANONYMOUS_ROUNDS : ENV.LOGGED_ROUNDS;
	}

	/**
	 * build and returns the game status object to put in responses
	 */
	status() {
		return {
			game_over: this.game_over,
			successes_left: this.successes_left,
			fails_left: this.fails_left,
		};
	}

	/*
	 * registers this game into the openGames hashmap
	 * and sets the initial starting cards
	 *
	 * the user_id must be used as the key to manipulate a game
	 *
	 * from now on there is a watchdog timer of 1 hour
	 * that removes the game if it is not completed whitin that time
	 */
	async open() {
		this.cards = await qCards.getStartingCards();
		this.lifecycle.open(this);
	}

	/**
	 * gracefully unregister the game
	 */
	close() {
		this.lifecycle.close();
	}

	/**
	 * generate the next round for the open game
	 *
	 * starts the round timer
	 *
	 * returns the card for that round and the current status
	 */
	async nextRound() {
		if (this.roundManager.pending_round) {
			throw new GameError(409, "There is still a pending round to be saved");
		}
		this.roundManager.startRoundTimer();

		// generate a new card not present in the current set
		let newCard = await qCards.getNewExcluding(this.cards);
		this.cards.push({ ...newCard }); // push a copy of the card to be played

		// return stripped card (hide misfortune) and status
		delete newCard.misfortune;
		return { card: newCard, status: this.status() };
	}

	/**
	 * stores the pending round for this game
	 *
	 * checks if the choice is correct based on prev and next misfortunes
	 *
	 * if prev or next are not set, it is the condition for a client-side round timeout
	 *
	 * saves the game if this is the last round
	 *
	 * returns the current status and information about the played round
	 */
	async saveRound(prev, next) {
		if (!this.roundManager.pending_round) {
			throw new GameError(409, "There is no pending round to be saved");
		}
		this.roundManager.stopRoundTimer();

		// the played card for the pending round is the one added last
		const currentCard = this.cards[this.cards.length - 1];

		const correct = this.roundManager.isCorrect(prev, next, currentCard.misfortune);

		// store played round
		let round = new Round(this.rounds.length + 1, currentCard.id, correct);
		this.rounds.push(round);

		if (correct) {
			this.successes_left--;
		} else {
			this.fails_left--;
		}

		// check if last round
		this.game_over = this.fails_left <= 0 || this.successes_left <= 0;
		if (this.game_over) {
			const won = this.fails_left > 0;
			// save game to history for logged users
			if (!this.anonymous) {
				await qGames.save(this.user_id, this.rounds, won, this.cards);
			}
			// close the game
			this.close();
		}

		return {
			status: this.status(),
			last_round: { ...round, timed_out: this.roundManager.round_timeout },
			// reveal last card full details only if correct
			reveal_card: correct || ENV.DEBUG ? this.cards[this.cards.length - 1] : null,
		};
	}
}
