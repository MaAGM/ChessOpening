"use client";

type EditorToolbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  canPromote: boolean;
  canMakeMainLine: boolean;
  canDelete: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPromote: () => void;
  onMakeMainLine: () => void;
  onDelete: () => void;
};

function ToolButton({
  label,
  title,
  disabled,
  danger,
  onClick,
}: {
  label: string;
  title: string;
  disabled: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-rose-500/40 text-rose-200 hover:bg-rose-500/20"
          : "border-slate-600 text-slate-200 hover:bg-slate-700/60"
      }`}
    >
      {label}
    </button>
  );
}

/** Actions sur la ligne affichée : annuler / rétablir, promouvoir, ligne principale, supprimer. */
export function EditorToolbar({
  canUndo,
  canRedo,
  canPromote,
  canMakeMainLine,
  canDelete,
  onUndo,
  onRedo,
  onPromote,
  onMakeMainLine,
  onDelete,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="toolbar" aria-label="Actions de l'éditeur">
      <ToolButton label="↶ Annuler" title="Annuler (Ctrl+Z)" disabled={!canUndo} onClick={onUndo} />
      <ToolButton
        label="↷ Rétablir"
        title="Rétablir (Ctrl+Maj+Z)"
        disabled={!canRedo}
        onClick={onRedo}
      />
      <ToolButton
        label="⇧ Promouvoir"
        title="Remonter cette variante d'un rang"
        disabled={!canPromote}
        onClick={onPromote}
      />
      <ToolButton
        label="★ Ligne principale"
        title="Faire de cette ligne la ligne principale"
        disabled={!canMakeMainLine}
        onClick={onMakeMainLine}
      />
      <ToolButton
        label="🗑 Supprimer"
        title="Supprimer ce coup et ses suites (Suppr)"
        disabled={!canDelete}
        danger
        onClick={onDelete}
      />
    </div>
  );
}
