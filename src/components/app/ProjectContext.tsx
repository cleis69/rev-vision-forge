import { createContext, useContext } from "react";

import type { Membership } from "@/components/app/Organizations";
import type { Project } from "@/lib/app/projects";

/** Programme open in /app/projets/$id, with the user's role in its organization. */
type CurrentProject = { project: Project; role: Membership["role"] };

const ProjectContext = createContext<CurrentProject | null>(null);

export const ProjectProvider = ProjectContext.Provider;

export function useCurrentProject(): CurrentProject {
  const value = useContext(ProjectContext);
  if (!value) throw new Error("useCurrentProject must be used inside the programme layout.");
  return value;
}
