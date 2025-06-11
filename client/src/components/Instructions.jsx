import { Row, Col, Badge } from "react-bootstrap";
import { PlayButton } from "@components/Game";
import useTitle from "@hooks/useTitle";

export default function Instructions() {
	useTitle("Stuff Happens", true);

	return (
		<>
			<Row className="my-3">
				<Col>
					<h1>Stuff Happens</h1> <Badge>Commuting Students' Life Edition</Badge>
					<div className="text-center">
						<PlayButton />
					</div>
				</Col>
			</Row>
			<Row className="my-3">
				<Col>
					<h2>Instructions</h2>
					You start with a deck of unlucky cards, each with a known level of misfortune, arranged in order of their
					misfortune.
					<br />
					For each round, a new unlucky card with an unknown level of misfortune will be shown to you.
					<br />
					Your task is to guess its misfortune by placing it in the correct position within your ordered deck.
				</Col>
			</Row>
			<Row className="my-3">
				<Col>
					<h3>Anonymous users</h3>
					Anonymous users can play only one round.
				</Col>
			</Row>
			<Row className="my-3">
				<Col>
					<h3>Registered users</h3>
					Registered users can play the full game, where they need to collect 3 cards while being allowed up to 3
					failures.
					<br />
					Each game report is saved in the History page.
				</Col>
			</Row>
		</>
	);
}
