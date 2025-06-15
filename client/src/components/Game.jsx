import { useNavigate } from "react-router";
import { useEffect, useContext, useState, Fragment } from "react";
import { Button, Card, Placeholder, Row, Col, Badge, Toast, ToastContainer } from "react-bootstrap";
import API from "@api";
import { UserContext, AlertContext } from "@context";
import { image } from "@assets/static";
import useCountdown from "@hooks/useCountdown";
import useTitle from "@hooks/useTitle";
import "@styles/Game.css";

const ROUND_TIMEOUT_SECONDS = import.meta.env.VITE_ROUND_TIMEOUT_SECONDS;

const defaultState = {
	cards: [1, 2, 3].map((id) => ({ id: id, description: "", img: "" })),
	roundState: {
		roundNum: 0,
		roundCard: null,
		roundOver: false,
		status: {},
	},
	toast: { show: false, message: "", variant: "" },
};

export default function Game() {
	const user = useContext(UserContext);
	const setAlert = useContext(AlertContext);

	const [cards, setCards] = useState(defaultState.cards);

	const [roundState, setRoundState] = useState(defaultState.roundState);

	const [toast, setToast] = useState(defaultState.toast);

	useTitle("Game");

	// start the game first time
	useEffect(() => {
		restart();
	}, []);

	function restart() {
		setCards(defaultState.cards);
		setRoundState(defaultState.roundState);

		API.game
			.start()
			.then((response) => {
				console.log("Game restarted. Initial status: ", response);
				setCards(response.cards);
			})
			.catch((err) => {
				console.log("Couldn't restart game: ", err);
				setAlert(`Couldn't restart game: ${err.message}`, "danger");
			});
	}

	const [roundSecondsLeft, haltRoundCountdown, restartRoundCountdown] = useCountdown(ROUND_TIMEOUT_SECONDS, () => {
		console.log("Round timeout.");
		submitRound(); // submit as failed
	});

	function nextRound() {
		API.game
			.nextRound()
			.then((response) => {
				console.log("Round: ", response);

				setRoundState((prevState) => ({
					...prevState,
					roundOver: false,
					roundCard: response.card,
					status: response.status,
					roundNum: prevState.roundNum + 1,
				}));

				// start countdown at each round
				restartRoundCountdown();
			})
			.catch((err) => {
				console.log("Couldn't retrieve next round: ", err);
				setAlert(`Couldn't retrieve next round: ${err.message}`, "danger");
			});
	}

	/**
	 * submit the round with the given button index
	 *
	 * automatically calls nextRound if the game is not over, otherwise sets the game as over
	 */
	function submitRound(index) {
		// Clear the countdown interval if it's still running
		haltRoundCountdown();

		let prev = null;
		let next = null;
		if (index != undefined) {
			prev = index == 0 ? 0 : cards[index - 1].misfortune;
			next = index == cards.length ? 101 : cards[index].misfortune;
		}
		API.game
			.submitRound(prev, next)
			.then((response) => {
				console.log("Round submitted. Current status: ", response);
				if (response.last_round.correct) {
					// add card to deck
					setCards((cards) => {
						const newCards = [...cards];
						newCards.splice(index, 0, response.reveal_card);
						return newCards;
					});
					setToast({ show: true, message: "Correct!", variant: "success" });
				} else {
					setToast({ show: true, message: response.last_round.timed_out ? "Time Out!" : "Wrong!", variant: "danger" });
				}
				setRoundState((prevState) => ({
					...prevState,
					status: response.status,
					roundOver: true,
				}));
				if (response.status.game_over) {
					return;
				}
			})
			.catch((err) => {
				console.log("Couldn't submit round: ", err);
				setAlert(`Couldn't submit round: ${err.message}`, "danger");
			});
	}

	return (
		<>
			{/* Toast Container */}
			<ToastContainer position="bottom-center" className="p-3">
				<Toast
					onClose={() => setToast({ ...toast, show: false })}
					show={toast.show}
					bg={toast.variant}
					delay={1500}
					autohide
				>
					<Toast.Body className="text-white text-center fw-bold">{toast.message}</Toast.Body>
				</Toast>
			</ToastContainer>

			<Row className="flex-center max-height-50">
				<Col className="flex-center">
					{roundState.roundNum > 0 ? (
						<Card
							className="flex-fill"
							bg={roundState.status.game_over ? (roundState.status.fails_left <= 0 ? "danger" : "success") : ""}
							text={roundState.status.game_over ? "white" : ""}
						>
							{roundState.status.game_over && (
								<Card.Header className="text-center fw-bold">
									{roundState.status.fails_left <= 0 ? "Game Lost" : "Game Won"}
								</Card.Header>
							)}
							<Card.Body className="flex-column">
								<Card.Title>
									<Row>
										<Col>
											Round <Badge bg="dark">{roundState.roundNum}</Badge>
										</Col>

										<Col>
											Fails left{" "}
											<Badge pill bg="danger" className="">
												{roundState.status.fails_left}
											</Badge>
										</Col>

										<Col>
											Cards to collect{" "}
											<Badge pill bg="success" className="">
												{roundState.status.successes_left}
											</Badge>
										</Col>

										{!user && (
											<Col>
												<Badge pill bg="warning" className="float-end text-dark">
													Anonymous
												</Badge>
											</Col>
										)}
									</Row>
								</Card.Title>
								<Row className="flex-center flex-fill mt-4 mb-4">
									<Col md={4} className="flex-center">
										{roundState.roundOver ? (
											<PlayButton
												className="shadow"
												nextRound={!roundState.status.game_over && nextRound}
												restart={roundState.status.game_over && restart}
											/>
										) : (
											<GameCard card={roundState.roundCard} />
										)}
									</Col>
								</Row>
							</Card.Body>
							{!roundState.roundOver && (
								<Card.Footer style={{ flex: "0 0 auto", width: "100%", padding: "0.5rem" }}>
									<CountDownProgressBar seconds={roundSecondsLeft} />
								</Card.Footer>
							)}
						</Card>
					) : (
						cards[0].img /* wait for starting cards to load */ && (
							<PlayButton className="w-100 shadow" variant={user ? "success" : "warning"} nextRound={nextRound} start />
						)
					)}
				</Col>
			</Row>

			{/* Cards Map */}
			<Row className="flex-grow-1 max-height-50 flex-center">
				{roundState.roundNum > 0 && !roundState.roundOver && <PlaceCardButton index={0} submitRound={submitRound} />}
				{cards.map((card, index) => (
					<Fragment key={card.id}>
						<Col className="d-flex">
							<GameCard card={card} />
						</Col>
						{roundState.roundNum > 0 && !roundState.roundOver && (
							<PlaceCardButton index={index + 1} submitRound={submitRound} />
						)}
					</Fragment>
				))}
			</Row>
		</>
	);
}

/**
 * the button is to the left of the card at `index` in the cards list
 *
 * for the last button the index is the lenght of the list
 *
 * on click it will submit the round
 */
function PlaceCardButton({ index, submitRound }) {
	return (
		<Col xs="auto" className="flex-center">
			<Button onClick={() => submitRound(index)}>
				<i className="bi bi-box-arrow-down" />
			</Button>
		</Col>
	);
}

export function PlayButton({ restart, nextRound, start, ...props }) {
	const navigate = useNavigate();
	const user = useContext(UserContext);

	return (
		<Button
			variant={user ? "success" : "warning"}
			onClick={nextRound || restart || (() => navigate("/game"))}
			{...props}
		>
			<i className="bi bi-play-fill" />{" "}
			{nextRound && !start ? "Next round" : start ? "Start" : "Play" + (restart ? " again" : "")}
		</Button>
	);
}

import ProgressBar from "react-bootstrap/ProgressBar";

function CountDownProgressBar({ seconds }) {
	const clampedSeconds = Math.max(0, seconds);
	const progress = (clampedSeconds * 100) / ROUND_TIMEOUT_SECONDS;
	const variants = ["success", "warning", "danger"];
	const variant = variants[progress > 66 ? 0 : progress > 33 ? 1 : 2];
	return (
		<div>
			<ProgressBar variant={variant} now={progress} label={`${clampedSeconds} s`} />
		</div>
	);
}

function GameCard({ card }) {
	const description = card.description;
	const misfortune = card.misfortune;
	const img = card.img;
	return (
		<Card className="game-card">
			<Card.Header className="game-card-header">
				{description ? (
					<Card.Text>{description}</Card.Text>
				) : (
					<Placeholder as={Card.Text} animation="glow">
						<Placeholder className="w-100" />
					</Placeholder>
				)}
			</Card.Header>
			<Card.Body className="game-card-body">
				{img && (
					<>
						{/* Blurred background image */}
						<div className="game-card-img-blur" style={{ backgroundImage: `url(${image(img)})` }} />
						{/* Actual image */}
						<Card.Img variant="bottom" src={image(img)} className="game-card-img" />
					</>
				)}
				{!img && (
					<Placeholder animation="glow" className="w-100 h-100">
						<Placeholder className="w-100" style={{ height: "250px" }} />
					</Placeholder>
				)}
			</Card.Body>
			{misfortune && (
				<Card.Footer>
					<small className="text-muted">Misfortune</small>{" "}
					<Badge bg="dark" className="float-end">
						{misfortune}
					</Badge>
				</Card.Footer>
			)}
		</Card>
	);
}
