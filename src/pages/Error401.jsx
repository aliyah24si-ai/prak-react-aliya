import ErrorPage from "../components/ErrorPage";

export default function Error401() {
  return (
    <ErrorPage
      kodeError="401"
      deskripsiError="Unauthorized - Kamu tidak memiliki akses"
      gambarError="https://illustrations.popsy.co/gray/crashed-error.svg"
    />
  );
}
