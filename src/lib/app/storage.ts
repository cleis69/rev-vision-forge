import { getSupabase } from "@/lib/supabase/client";

/* Files of the promoter space, in the public bucket project-media:
   <organization_id>/<project_id>/plan/… for plans, <organization_id>/brand/… later.
   The storage rules let members write only inside their organization's
   programmes, so files are removed before the programme itself. */

export const BUCKET = "project-media";

const bucket = () => getSupabase().storage.from(BUCKET);

export const publicUrl = (path: string) => bucket().getPublicUrl(path).data.publicUrl;

/** Path of the 1 600 px version of a plan, next to the large one. */
export const smallPlanPath = (path: string) => path.replace(/(\.[a-z0-9]+)$/i, "-1600$1");

export async function uploadFile(path: string, file: Blob) {
  const { error } = await bucket().upload(path, file, {
    contentType: file.type,
    // Names are unique: a file never changes once uploaded.
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
}

export async function removeFiles(paths: string[]) {
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await bucket().remove(paths.slice(i, i + 100));
    if (error) throw error;
  }
}

/** Every file under a folder, sub-folders included. */
async function listFiles(prefix: string): Promise<string[]> {
  const files: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await bucket().list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const item of data) {
      const path = `${prefix}/${item.name}`;
      // Folders come back without an id.
      if (!item.id) files.push(...(await listFiles(path)));
      else files.push(path);
    }
    if (data.length < 1000) return files;
  }
}

/** Removes a folder and everything in it (a programme or an organization). */
export async function removeFolder(prefix: string) {
  const files = await listFiles(prefix);
  if (files.length > 0) await removeFiles(files);
}
