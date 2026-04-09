import { useActor as useActorBase } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { BackendActor } from "../types";

/**
 * Returns the backend actor and fetching state.
 * Wraps @caffeineai/core-infrastructure useActor with the project's createActor.
 */
export function useActor(): {
  actor: BackendActor | null;
  isFetching: boolean;
} {
  return useActorBase(createActor) as {
    actor: BackendActor | null;
    isFetching: boolean;
  };
}
