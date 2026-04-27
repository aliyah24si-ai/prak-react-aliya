import ErrorPage from "../../components/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      kodeError="404"
      deskripsiError="Halaman Tidak Ditemukan"
      gambarError="https://illustrations.popsy.co/gray/crashed-error.svg"
    />
  );
}
