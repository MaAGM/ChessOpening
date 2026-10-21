"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSyncStatus,
  getSyncStatus,
  subscribeSyncStatus,
} from "@/lib/review/syncStatus";

/** État de la synchronisation cloud (synchronisé, en cours, hors ligne, erreur). */
export function useSyncStatus() {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, getServerSyncStatus);
}
