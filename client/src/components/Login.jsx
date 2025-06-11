import { useActionState } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";
import useTitle from "@hooks/useTitle";

export function LoginForm({ performLogin }) {
	useTitle("Login");

	const [state, formAction, isPending] = useActionState(submit, { username: "", password: "" });

	async function submit(prevState, formData) {
		const credentials = {
			username: formData.get("username"),
			password: formData.get("password"),
		};

		return await performLogin(credentials);
	}

	return (
		<>
			{isPending && (
				<Row className="justify-content-center">
					<Col>
						<Alert variant="info">Logging in...</Alert>
					</Col>
				</Row>
			)}
			<Row className="justify-content-center">
				<Col md={4}>
					<h1>Login</h1>
					<Form action={formAction}>
						<Form.Group controlId="username" className="mb-3">
							<Form.Label>Username</Form.Label>
							<Form.Control type="text" name="username" required />
						</Form.Group>

						<Form.Group controlId="password" className="mb-3">
							<Form.Label>Password</Form.Label>
							<Form.Control type="password" name="password" required minLength={6} />
						</Form.Group>

						{state.message && <p className={state.type == "error" ? "text-danger" : "text-warning"}>{state.message}</p>}

						<Button type="submit" disabled={isPending}>
							Login
						</Button>
					</Form>
				</Col>
			</Row>
		</>
	);
}

export function LoginButton() {
	const navigate = useNavigate();

	return (
		<Button variant="outline-light" onClick={() => navigate("/login")}>
			Login
		</Button>
	);
}
