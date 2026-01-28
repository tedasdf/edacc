// src/lib/hooks/usePassages.tsx
"use client";
import { getAllPassages, getPassageById } from "../passages";

export function usePassages() {
  return {
    getPassageSummaries: getAllPassages,
    getFullPassage: getPassageById
  };
}