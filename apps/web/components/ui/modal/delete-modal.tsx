export function ModalDelete ({
  title,
  description,
  onConfirm,
  onCancel
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-xs text-gray-600">{description}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}