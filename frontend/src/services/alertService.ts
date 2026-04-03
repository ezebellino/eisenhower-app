import Swal from "sweetalert2";
import type { UserSummary } from "./userService";

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function selectDuplicationTargets(
  users: UserSummary[],
  currentAssigneeLabel?: string | null
): Promise<number[] | "all" | null> {
  const html = `
    <div class="swal-staff-picker">
      <p style="margin:0 0 12px 0;color:#c7d4ea;">
        ${currentAssigneeLabel ? `Responsable actual: <strong>${escapeHtml(currentAssigneeLabel)}</strong><br />` : ""}
        Selecciona a quien quieres duplicar esta tarea.
      </p>
      <div style="display:grid;gap:10px;max-height:240px;overflow:auto;text-align:left;">
        ${users
          .map(
            (user) => `
              <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);cursor:pointer;">
                <input type="checkbox" value="${user.id}" data-duplicate-target />
                <span>${escapeHtml(user.username)}${user.role === "supervisor" ? " (Supervisor)" : ""}</span>
              </label>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  const result = await Swal.fire({
    ...baseOptions,
    title: "Duplicar para otros",
    html,
    showCancelButton: true,
    showDenyButton: users.length > 1,
    confirmButtonText: "Duplicar seleccionados",
    denyButtonText: "Todo el staff",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const container = Swal.getHtmlContainer();
      const checked = Array.from(
        container?.querySelectorAll<HTMLInputElement>('input[data-duplicate-target]:checked') ?? []
      ).map((input) => Number(input.value));

      if (checked.length === 0) {
        Swal.showValidationMessage("Selecciona al menos una persona.");
        return undefined;
      }

      return checked;
    },
  });

  if (result.isDenied) return "all";
  if (result.isConfirmed) return result.value as number[];
  return null;
}
