import { useEffect, useMemo, useState } from "react";
import { mutateWord } from "../utils/grammar";
import { normalizeOutcomeValue } from "../services/csvFieldMap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShieldCheck, Wrench } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

function getRowValue(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) {
      return String(row[key]);
    }
  }
  return "";
}

function makeInitialForm(row) {
  const base = getRowValue(row, "base", "Base");
  const outcome = normalizeOutcomeValue(getRowValue(row, "outcome", "Outcome")) || "none";
  const answer = getRowValue(row, "answer", "Answer") || mutateWord(base, outcome);

  return {
    before: getRowValue(row, "before", "Before"),
    base,
    after: getRowValue(row, "after", "After"),
    answer,
    outcome,
    trigger: getRowValue(row, "trigger", "Trigger"),
    category: getRowValue(row, "category", "Category"),
    translate: getRowValue(row, "translate", "Translate"),
    translateSent: getRowValue(row, "translateSent", "TranslateSent"),
    why: getRowValue(row, "why", "Why"),
    whyCym: getRowValue(row, "whyCym", "Why-Cym", "WhyCym"),
  };
}

const OUTCOME_OPTIONS = [
  { value: "soft", label: "Soft" },
  { value: "nasal", label: "Nasal" },
  { value: "aspirate", label: "Aspirate" },
  { value: "none", label: "None" },
];

export default function AdminCardControls({
  row,
  isAuthenticated,
  authConfigured,
  authError,
  onLogin,
  onLogout,
  onSave,
}) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [logoutBusy, setLogoutBusy] = useState(false);

  const [form, setForm] = useState(() => makeInitialForm(row));
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [editorNotice, setEditorNotice] = useState("");
  const [manualAnswer, setManualAnswer] = useState(false);

  useEffect(() => {
    if (!editorOpen) return;
    setForm(makeInitialForm(row));
    setManualAnswer(false);
    setEditorError("");
    setEditorNotice("");
  }, [editorOpen, row]);

  const suggestedAnswer = useMemo(() => {
    return mutateWord(form.base, form.outcome || "none");
  }, [form.base, form.outcome]);

  useEffect(() => {
    if (!editorOpen || manualAnswer) return;
    setForm((prev) => ({ ...prev, answer: suggestedAnswer }));
  }, [editorOpen, manualAnswer, suggestedAnswer]);

  const explanationPairIncomplete = Boolean(
    (form.why && !form.whyCym) || (!form.why && form.whyCym)
  );

  const isRowWritable = Boolean(
    row && row.__source && Number.isInteger(row.__rowIndex) && row.__rowIndex >= 0
  );

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      await onLogin(password);
      setPassword("");
      setLoginOpen(false);
    } catch (error) {
      setLoginError(error?.message || "Login failed.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    setLogoutBusy(true);
    try {
      await onLogout();
      setEditorOpen(false);
    } finally {
      setLogoutBusy(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!isRowWritable) {
      setEditorError("This card cannot be saved because its source row is unknown.");
      return;
    }

    setEditorBusy(true);
    setEditorError("");
    setEditorNotice("");

    try {
      await onSave({ row, patch: form });
      setEditorNotice("Saved to source file.");
    } catch (error) {
      setEditorError(error?.message || "Failed to save card changes.");
    } finally {
      setEditorBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isAuthenticated && (
        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
          <DialogTrigger asChild>
            <Badge variant="admin" className="cursor-pointer gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </Badge>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleLoginSubmit}>
              <DialogHeader>
                <DialogTitle>Admin Login</DialogTitle>
                <DialogDescription>
                  Enter the shared admin password to enable live card correction.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
                {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
                {!loginError && authError ? (
                  <p className="text-sm text-destructive">{authError}</p>
                ) : null}
                {!authConfigured ? (
                  <p className="text-sm text-muted-foreground">
                    Server has no admin password configured.
                  </p>
                ) : null}
              </div>

              <DialogFooter className="mt-5">
                <Button type="submit" disabled={loginBusy || !password}>
                  {loginBusy ? "Signing in..." : "Sign in"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isAuthenticated && (
        <>
          <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
            <DialogTrigger asChild>
              <Badge
                variant="admin"
                className={`cursor-pointer gap-1.5 ${!row ? "pointer-events-none opacity-50" : ""}`}
              >
                <Wrench className="h-3 w-3" />
                Edit current card
              </Badge>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>Admin Card Editor</DialogTitle>
                  <DialogDescription>
                    Live edit this card and save directly to {row?.__source || "source file"}.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Card ID</Label>
                    <Input value={getRowValue(row, "cardId", "CardId")} readOnly />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-before">Before</Label>
                    <Input
                      id="admin-before"
                      value={form.before}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, before: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-after">After</Label>
                    <Input
                      id="admin-after"
                      value={form.after}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, after: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-base">Baseword</Label>
                    <Input
                      id="admin-base"
                      value={form.base}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, base: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-outcome">Outcome</Label>
                    <select
                      id="admin-outcome"
                      value={form.outcome}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, outcome: event.target.value }))
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      {OUTCOME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="admin-answer">Answer</Label>
                    <Input
                      id="admin-answer"
                      value={form.answer}
                      onChange={(event) => {
                        setManualAnswer(true);
                        setForm((prev) => ({ ...prev, answer: event.target.value }));
                      }}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Suggested: {suggestedAnswer || "(empty)"}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setManualAnswer(false);
                          setForm((prev) => ({ ...prev, answer: suggestedAnswer }));
                        }}
                      >
                        Use suggested
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-trigger">Trigger</Label>
                    <Input
                      id="admin-trigger"
                      value={form.trigger}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, trigger: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-category">Category</Label>
                    <Input
                      id="admin-category"
                      value={form.category}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, category: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-translate">Word Meaning (English)</Label>
                    <Input
                      id="admin-translate"
                      value={form.translate}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, translate: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-translate-sent">Sentence Meaning (English)</Label>
                    <Input
                      id="admin-translate-sent"
                      value={form.translateSent}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, translateSent: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="admin-why-en">Explanation (English)</Label>
                    <Textarea
                      id="admin-why-en"
                      className="min-h-[84px]"
                      value={form.why}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, why: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="admin-why-cy">Esboniad (Cymraeg)</Label>
                    <Textarea
                      id="admin-why-cy"
                      className="min-h-[84px]"
                      value={form.whyCym}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, whyCym: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                  {explanationPairIncomplete ? (
                    <p className="text-amber-600">
                      Warning: explanation pair is incomplete (English/Welsh). Save is still allowed.
                    </p>
                  ) : null}
                  {editorError ? <p className="text-destructive">{editorError}</p> : null}
                  {editorNotice ? <p className="text-emerald-700">{editorNotice}</p> : null}
                </div>

                <DialogFooter className="mt-5">
                  <Button type="submit" disabled={editorBusy || !isRowWritable}>
                    {editorBusy ? "Saving..." : "Save to source"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button type="button" variant="ghost" size="sm" onClick={handleLogout} disabled={logoutBusy}>
            {logoutBusy ? "Signing out..." : "Logout"}
          </Button>
        </>
      )}
    </div>
  );
}


