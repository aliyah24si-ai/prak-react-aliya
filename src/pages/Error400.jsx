import ErrorPage from "../components/ErrorPage";

export default function Error400() {
  return (
    <ErrorPage
      kodeError="400"
      deskripsiError="Bad Request"
      gambarError="https://illustrations.popsy.co/gray/crashed-error.svg"
    />
  );
}
