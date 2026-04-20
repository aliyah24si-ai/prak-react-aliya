import ErrorPage from "../components/ErrorPage";

export default function Error403() {
  return (
    <ErrorPage
      kodeError="403"
      deskripsiError="Forbidden - Akses ditolak"
      gambarError="https://illustrations.popsy.co/gray/crashed-error.svg"
    />
  );
}
