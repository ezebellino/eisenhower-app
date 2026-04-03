import Swal from "sweetalert2";

const baseOptions = {
  background: "#0d1728",
  color: "#f4f8ff",
  confirmButtonColor: "#9dc7ff",
  cancelButtonColor: "#23324b",
};

export async function confirmDestructiveAction(options: {
  title: string;
  text: string;
  confirmButtonText?: string;
}) {
  const result = await Swal.fire({
    ...baseOptions,
    icon: "warning",
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    title: options.title,
    text: options.text,
    confirmButtonText: options.confirmButtonText ?? "Confirmar",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
}

export async function showSuccessToast(title: string) {
  await Swal.fire({
    ...baseOptions,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    icon: "success",
    title,
  });
}

export async function showErrorAlert(title: string, text: string) {
  await Swal.fire({
    ...baseOptions,
    icon: "error",
    title,
    text,
    confirmButtonText: "Entendido",
  });
}

export async function showInfoAlert(title: string, text: string) {
  await Swal.fire({
    ...baseOptions,
    icon: "info",
    title,
    text,
    confirmButtonText: "Seguir",
  });
}
