/**
 * Espace de stockage local (localStorage) disponible, tel que les navigateurs l'annoncent
 * en général (environ 5 Mo par site, partagés entre toutes les données de l'application).
 * C'est une estimation : le vrai quota dépend du navigateur.
 */
export const ASSUMED_QUOTA_BYTES = 5 * 1024 * 1024;

type StorageLike = Pick<Storage, "length" | "key" | "getItem">;

/**
 * Espace occupé par le localStorage du site, en octets (2 octets par caractère, comme
 * le comptent les navigateurs). Renvoie 0 si le stockage est indisponible.
 */
export function getLocalStorageUsageBytes(storage?: StorageLike): number {
  try {
    const target = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
    if (!target) return 0;

    let total = 0;
    for (let i = 0; i < target.length; i++) {
      const key = target.key(i);
      if (key === null) continue;
      total += (key.length + (target.getItem(key)?.length ?? 0)) * 2;
    }
    return total;
  } catch {
    return 0;
  }
}

/** Part du quota utilisée (0 à 1 et plus). */
export function storageUsageRatio(bytes: number, quota: number = ASSUMED_QUOTA_BYTES): number {
  return quota > 0 ? bytes / quota : 0;
}

/** « 812 Ko », « 1,3 Mo ». */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
