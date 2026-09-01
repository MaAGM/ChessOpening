type OpeningNameProps = {
  name: string | null;
};

export function OpeningName({ name }: OpeningNameProps) {
  if (!name) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2">
      <p className="text-xs uppercase tracking-wide text-[#D4AF37]/80">Opening</p>
      <p className="text-lg font-semibold text-slate-100">{name}</p>
    </div>
  );
}