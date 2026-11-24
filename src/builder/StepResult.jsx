import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ExternalLink, GitBranch, Globe, Hammer, Loader2, Rocket } from "lucide-react";
import { ErrorBox, Spinner, card, ghostBtn, inputCls, label, primaryBtn } from "./ui";
import { summarize } from "./builderState";

function Checks({ checklist }) {
  const failed = checklist.checks.filter((c) => !c.pass);
  const passed = checklist.checks.length - failed.length;
  return (
    <div>
      <p className="flex items-center gap-2 text-sm text-slate-200">
        <CheckCircle2 className={`h-4 w-4 ${failed.length ? "text-amber-300" : "text-emerald-300"}`} />
        <span data-testid="check-count">
          {passed} of {checklist.checks.length} checks passed
        </span>
      </p>
      {failed.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-amber-200">
          {failed.map((c) => (
            <li key={c.name}>{c.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Three big steps: Build, GitHub, Live. Shows which one is done, running or waiting. */
function Pipeline({ built, pushed, live, busy }) {
  const steps = [
    { id: "build", label: "Build", Icon: Hammer, done: built, running: busy === "building" },
    { id: "github", label: "GitHub", Icon: GitBranch, done: pushed, running: busy === "pushing" },
    { id: "live", label: "Live", Icon: Globe, done: live, running: busy === "deploying" },
  ];
  return (
    <ol className="flex items-center" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s.id} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <motion.span
              animate={s.running ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={s.running ? { repeat: Infinity, duration: 1.2 } : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm transition ${
                s.done ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300" : s.running ? "border-sky-400/70 bg-sky-400/15 text-sky-300 shadow-[0_0_24px_-4px_rgba(56,189,248,0.8)]" : "border-white/[0.12] bg-white/[0.03] text-slate-500"
              }`}
            >
              {s.done ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : s.running ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <s.Icon className="h-5 w-5" aria-hidden />}
            </motion.span>
            <span className={`text-xs font-medium ${s.done ? "text-emerald-300" : s.running ? "text-sky-300" : "text-slate-500"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-2 mb-5 h-0.5 flex-1 overflow-hidden rounded bg-white/[0.08]">
              <motion.div className="h-full bg-emerald-400/70" initial={false} animate={{ width: s.done ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function StepResult({ state, dispatch, onBuild, onPush, onDeploy }) {
  const { buildResult, repo, deployment, busy } = state;
  const building = busy === "building";

  return (
    <div className="space-y-6">
      <div className={card}>
        <p className="text-lg font-semibold text-white">{summarize(state.config)}</p>
        <div className="mt-6">
          <Pipeline built={Boolean(buildResult)} pushed={Boolean(repo)} live={Boolean(deployment)} busy={busy} />
        </div>
        <div className="mt-6 max-w-md">
          <label htmlFor="project-name" className={label}>
            Project name (becomes the folder and the GitHub repo)
          </label>
          <input id="project-name" className={inputCls} value={state.projectName} onChange={(e) => dispatch({ type: "projectName", value: e.target.value })} disabled={building || Boolean(buildResult)} placeholder="my-site" />
        </div>
        {!buildResult && (
          <div className="mt-4 flex items-center gap-4">
            <button type="button" className={primaryBtn} disabled={!state.projectName || Boolean(busy)} onClick={onBuild}>
              <Hammer className="h-4 w-4" /> Build the project
            </button>
            {building && <Spinner text="Assembling and checking…" />}
          </div>
        )}
      </div>

      {buildResult && (
        <div className={`${card} space-y-4`} data-testid="build-result">
          <h2 className="text-sm font-semibold text-white">Your project is ready</h2>
          <Checks checklist={buildResult.verify.checklist} />
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Components reused</dt>
              <dd className="text-slate-200">{buildResult.lock.reuse?.components ?? Object.keys(buildResult.lock.components).length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">New code written</dt>
              <dd className="text-slate-200">{buildResult.lock.reuse?.newCode ?? 0} lines</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Saved on the server as</dt>
              <dd className="truncate text-slate-200">output/{buildResult.name}</dd>
            </div>
          </dl>
          <p className="text-xs text-slate-500">The exact version of every component is recorded in sparc.lock.json inside the project.</p>

          <div className="border-t border-white/[0.08] pt-4">
            <p className="mb-3 text-sm text-slate-300">Put it online (uses your server's GitHub and Vercel access):</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={ghostBtn} disabled={Boolean(busy) || Boolean(repo)} onClick={onPush}>
                <GitBranch className="h-4 w-4" /> {repo ? "Pushed to GitHub" : "Push to GitHub"}
              </button>
              <button type="button" className={primaryBtn} disabled={!repo || Boolean(busy) || Boolean(deployment)} onClick={onDeploy}>
                <Rocket className="h-4 w-4" /> {deployment ? "Deployed" : "Deploy"}
              </button>
              {busy === "pushing" && <Spinner text="Creating the repository…" />}
              {busy === "deploying" && <Spinner text="Deploying (this can take a minute)…" />}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {repo && (
                <li>
                  <a className="inline-flex items-center gap-1 text-sky-300 hover:underline" href={repo.repoUrl} target="_blank" rel="noreferrer">
                    Repository <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
              )}
            </ul>
            {deployment && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <Rocket className="h-4 w-4" aria-hidden /> Your website is live!
                </p>
                <a className="mt-2 inline-flex items-center gap-1 break-all text-sm text-sky-300 hover:underline" href={deployment.deploymentUrl} target="_blank" rel="noreferrer">
                  Live site <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="ml-2 text-xs text-slate-400">{deployment.message}</span>
              </motion.div>
            )}
          </div>
        </div>
      )}

      <ErrorBox message={state.error} />

      <div className="flex gap-3">
        <button type="button" className={ghostBtn} onClick={() => dispatch({ type: "goto", step: "plan" })} disabled={Boolean(busy)}>
          <ArrowLeft className="h-4 w-4" /> Back to the plan
        </button>
        {buildResult && (
          <button type="button" className={ghostBtn} onClick={() => dispatch({ type: "restart" })} disabled={Boolean(busy)}>
            Build another
          </button>
        )}
      </div>
    </div>
  );
}
