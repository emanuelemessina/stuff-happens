import { useEffect, useState, useContext } from "react";
import { Accordion, Table, Badge, Row, Placeholder } from "react-bootstrap";
import API from "@api";
import dayjs from "dayjs";
import useTitle from "@hooks/useTitle";
import { AlertContext } from "@context";

export default function History() {
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(true);
	const setAlert = useContext(AlertContext);

	useTitle("History");

	useEffect(() => {
		async function fetchHistory() {
			try {
				const userGames = await API.user.getHistory();
				setGames(userGames);
			} catch (error) {
				console.error("Failed to fetch game history:", error);
				setAlert(`Failed to fetch game history: ${error.message}`, "danger");
			} finally {
				setLoading(false);
			}
		}

		fetchHistory();
	}, []);

	return (
		<Row>
			<h1 className="mb-3">Game History</h1>
			{loading ? (
				<>
					{[...Array(6)].map((_, index) => (
						<Placeholder as="div" animation="wave" key={index} className="mb-3">
							<Placeholder xs={12} className="rounded" style={{ height: "2.5rem" }} /> {/* Thicker placeholder */}
						</Placeholder>
					))}
				</>
			) : games.length > 0 ? (
				<Accordion>
					{games.map((game, index) => {
						const totalCorrect = game.rounds.filter((round) => round.correct).length + 3;
						return (
							<Accordion.Item eventKey={index} key={game.timestamp}>
								<Accordion.Header>
									<span>
										<Badge bg={game.won ? "success" : "danger"} className="me-3">
											{game.won ? "Won" : "Lost"}
										</Badge>
										{dayjs(game.timestamp).format("MMMM D, YYYY h:mm A")}
									</span>
								</Accordion.Header>
								<Accordion.Body>
									<p>
										<strong>Rounds:</strong> {game.rounds_num}
										<br />
										<strong>Cards in deck:</strong> {totalCorrect}
									</p>
									<Table striped bordered hover>
										<thead>
											<tr>
												<th>Round</th>
												<th>Description</th>
												<th>Collected</th>
											</tr>
										</thead>
										<tbody>
											{/* Initial cards as rounds with idx 0 */}
											{game.rounds
												.filter((round) => round.idx === 0)
												.map((round, index) => (
													<tr key={`initial-${index}`}>
														<td>-</td>
														<td>{round.card.description}</td>
														<td>Initial</td>
													</tr>
												))}
											{/* Cards from actual rounds */}
											{game.rounds
												.filter((round) => round.idx > 0)
												.map((round, index) => (
													<tr key={`round-${index}`}>
														<td>{round.idx}</td>
														<td>{round.card.description}</td>
														<td className={round.correct ? "text-success" : "text-danger"}>
															{round.correct ? "Yes" : "No"}
														</td>
													</tr>
												))}
										</tbody>
									</Table>
								</Accordion.Body>
							</Accordion.Item>
						);
					})}
				</Accordion>
			) : (
				<p>No games played yet.</p>
			)}
		</Row>
	);
}
