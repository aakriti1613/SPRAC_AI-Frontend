// Talks to the platform backend for the builder screen.
// `fetchApi(path, init)` is passed in (the app gives it apiFetch, tests give a
// fake), so this file has no browser or Vite dependency.

async function call(fetchApi, path, { method = "GET", body } = {}) {
  const res = await fetchApi(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 404 && /\/api\/(plan|compose|sparc|registry|build)/.test(path)) {
    throw new Error("The builder is switched off on the server. Set SPARC_API_ENABLED=1 on the backend and restart it.");
  }
  if (!res.ok || data.success === false) {
    // /api/build answers 200 with success:false and a list of errors; surface them.
    const detail = Array.isArray(data.errors) && data.errors.length ? ` ${data.errors.slice(0, 3).join("; ")}` : "";
    throw Object.assign(new Error((data.error || `Request failed (${res.status}).`) + detail), { data, status: res.status });
  }
  return data;
}

export function createBuilderClient(fetchApi) {
  return {
    options: () => call(fetchApi, "/api/sparc/options"),

    /** description -> plan (config, modules used, questions, reuse score). */
    plan: ({ description, styleLevel }) => call(fetchApi, "/api/plan", { method: "POST", body: { description, ...(styleLevel ? { styleLevel } : {}) } }),

    /** Rebuild the config from the user's edited choices. Never throws on a validation problem: returns it. */
    async rebuild(signals) {
      try {
        return await call(fetchApi, "/api/sparc/config", { method: "POST", body: { signals } });
      } catch (err) {
        if (err.data?.config) return { success: false, config: err.data.config, errors: err.data.errors || [err.message] };
        throw err;
      }
    },

    /** Which verified component fills each room at this style, plus the reuse lock. */
    compose: ({ websiteType, styleLevel, enabledOptional }) => call(fetchApi, "/api/compose", { method: "POST", body: { websiteType, styleLevel, enabledOptional } }),

    /** Assemble the project into the server's output folder, ready to push and deploy. */
    build: ({ config, name }) => call(fetchApi, "/api/build", { method: "POST", body: { config, name, forDeploy: true } }),

    push: ({ projectName, description }) => call(fetchApi, "/api/push", { method: "POST", body: { projectName, description } }),
    deploy: ({ repoName, owner }) => call(fetchApi, "/api/deploy", { method: "POST", body: { repoName, owner } }),
  };
}

/** Edit -> rebuild the config -> show which components fill the rooms. */
export async function refreshFromSignals(client, signals) {
  const rebuilt = await client.rebuild(signals);
  if (!rebuilt.config || (rebuilt.errors && rebuilt.errors.length)) {
    return { config: rebuilt.config || null, errors: rebuilt.errors || [], composition: null, lock: null };
  }
  const composed = await client.compose({ websiteType: rebuilt.config.websiteType, styleLevel: rebuilt.config.styleLevel, enabledOptional: rebuilt.config.rooms.enabled });
  return { config: rebuilt.config, errors: [], composition: composed.composition, lock: composed.lock };
}
