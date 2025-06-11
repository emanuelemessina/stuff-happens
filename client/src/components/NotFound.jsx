import useTitle from "@hooks/useTitle";

export default function NotFound() {
	useTitle("Not Found");
	return <p className="lead">It so happens that the requested page does not exist... stuff happens!</p>;
}
