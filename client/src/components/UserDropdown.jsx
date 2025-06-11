import Dropdown from "react-bootstrap/Dropdown";
import { DropdownButton } from "react-bootstrap";
import { useNavigate } from "react-router";

export default function UserDropdown({ username, performLogout }) {
	const navigate = useNavigate();

	return (
		<DropdownButton variant="primary" drop="start" title={username}>
			<Dropdown.Item onClick={() => navigate("/user/history")}>History</Dropdown.Item>
			<Dropdown.Divider />
			<Dropdown.Item
				onClick={() => {
					performLogout();
					navigate("/");
				}}
			>
				Logout
			</Dropdown.Item>
		</DropdownButton>
	);
}
