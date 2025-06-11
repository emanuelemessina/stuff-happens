import { useContext, useEffect, useState } from "react";
import { Button, Container, Navbar, Badge, Col, Row } from "react-bootstrap";
import { Link, useLocation } from "react-router";
import { LoginButton } from "@components/Login";
import UserDropdown from "@components/UserDropdown";
import { UserContext } from "@context";
import useDarkMode from "@hooks/useDarkMode";

export default function NavHeader({ performLogout }) {
	const [darkMode, toggleDarkMode] = useDarkMode();

	const user = useContext(UserContext);
	const location = useLocation();
	const isGame = location.pathname.includes("game");

	return (
		<Navbar bg="primary" data-bs-theme="dark">
			<Container fluid>
				<Row className="flex-grow-1">
					<Col className="d-flex align-items-center">
						<Link to="/" className="navbar-brand">
							Stuff Happens
						</Link>
						{isGame && (
							<Badge bg="light" text="dark" className="ms-2">
								Game
							</Badge>
						)}
					</Col>
					<Col className="d-flex justify-content-center">
						<Button onClick={toggleDarkMode}>
							{darkMode ? <i className="bi bi-sun-fill" /> : <i className="bi bi-moon-fill" />}
						</Button>
					</Col>
					<Col className="d-flex justify-content-end">
						{user ? <UserDropdown username={user.username} performLogout={performLogout} /> : <LoginButton />}
					</Col>
				</Row>
			</Container>
		</Navbar>
	);
}
