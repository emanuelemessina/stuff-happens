import { Alert, Container, Row, Col, Stack } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "@components/NavHeader";
import { AlertContext } from "@context";
import { useContext } from "react";

export default function DefaultLayout({ performLogout, alert }) {
	const setAlert = useContext(AlertContext);

	return (
		<Stack gap={3} className="vh-100 p-0 pb-3">
			<NavHeader performLogout={performLogout} />
			{/* general purpose UI message */}
			{alert.message /* important to cause a rerender, otherwise the alert stays dismissed */ && (
				<Row className="d-flex justify-content-center w-100">
					<Col lg={6} className="d-flex align-items-center" style={{ flexDirection: "column" }}>
						<Alert variant={alert.type} onClose={() => setTimeout(() => setAlert(), 1000)} dismissible>
							{alert.message}
						</Alert>
					</Col>
				</Row>
			)}
			{/* render router's children */}
			<Container className="flex-grow-1 d-flex">
				<Stack className="flex-grow-1 d-flex">
					<Outlet />
				</Stack>
			</Container>
		</Stack>
	);
}
