"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  Table2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Post, Question, QuizResult, PostCategory } from "@/lib/types";
import { POST_CATEGORIES } from "@/lib/types";
import { cn, formatDate, formatInt, slugify } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import type { Dict } from "@/lib/i18n/dictionaries";
import { Markdown } from "@/components/markdown";

/* ── shared bits ─────────────────────────────────────────────────── */

function ConfirmButton({
  onConfirm,
  label = "delete",
  className,
}: {
  onConfirm: () => void;
  label?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      onClick={() => {
        if (armed) {
          onConfirm();
          setArmed(false);
        } else {
          setArmed(true);
        }
      }}
      className={cn(
        "rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
        armed
          ? "bg-fault/15 text-fault"
          : "text-faint hover:text-fault",
        className,
      )}
    >
      {armed ? "confirm?" : label}
    </button>
  );
}

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-field border border-line bg-panel px-3 py-2.5 text-sm text-ink placeholder:text-faint/60 focus:border-signal/60";
const inputMonoCls =
  "w-full rounded-field border border-line bg-panel px-3 py-2.5 font-mono text-sm text-ink placeholder:text-faint/60 focus:border-signal/60";

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-selected={active}
      role="tab"
      className={cn(
        "relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm transition-colors",
        active ? "text-signal" : "text-faint hover:text-static",
      )}
    >
      {icon}
      {label}
      {active && (
        <motion.span
          layoutId="admin-tab"
          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-signal"
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </button>
  );
}

/* ── posts tab ───────────────────────────────────────────────────── */

interface PostDraft {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory;
  cover_url: string;
  published: boolean;
  content: string;
}

const EMPTY_DRAFT: PostDraft = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  category: "OSI",
  cover_url: "",
  published: false,
  content: "",
};

function PostsTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<PostDraft | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const edit = (post: Post) => {
    setSlugTouched(true);
    setDraft({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      cover_url: post.cover_url ?? "",
      published: post.published,
      content: post.content,
    });
    setPreview(false);
    setError(null);
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!draft.content.trim()) {
      setError("Content is required — an empty article can't be published.");
      return;
    }
    setSaving(true);
    setError(null);

    const slug = slugify(draft.slug || draft.title) || `post-${Date.now()}`;
    const supabase = createClient();
    const row = {
      title: draft.title.trim(),
      slug,
      excerpt: draft.excerpt.trim(),
      content: draft.content,
      category: draft.category,
      cover_url: draft.cover_url.trim() || null,
      published: draft.published,
    };

    const { error: err } = draft.id
      ? await supabase.from("posts").update(row).eq("id", draft.id)
      : await supabase.from("posts").insert(row);

    if (err) {
      setError(
        /duplicate|unique/i.test(err.message)
          ? `Slug "${slug}" is already taken — pick another.`
          : err.message,
      );
      setSaving(false);
      return;
    }

    setDraft(null);
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", id);
    load();
  };

  if (draft) {
    return (
      <div className="rounded-card border border-line bg-rack p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {draft.id ? "Edit post" : "New post"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview((p) => !p)}
              className={cn(
                "rounded-md px-3 py-1.5 font-mono text-xs transition-colors",
                preview
                  ? "bg-signal/15 text-signal"
                  : "text-faint hover:text-static",
              )}
            >
              {preview ? "editing" : "preview"}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="rounded-md px-3 py-1.5 font-mono text-xs text-faint hover:text-fault"
            >
              discard
            </button>
          </div>
        </div>

        {preview ? (
          <div className="mt-5 rounded-field border border-line bg-panel p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-faint">
              {draft.category} · {draft.published ? "published" : "draft"}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
              {draft.title || "Untitled"}
            </h1>
            <div className="mt-4">
              <Markdown>{draft.content || "*nothing to preview yet*"}</Markdown>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="title">
                <input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      title: e.target.value,
                      slug: slugTouched ? draft.slug : slugify(e.target.value),
                    })
                  }
                  placeholder="Post title"
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="slug (url)">
                <input
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setDraft({ ...draft, slug: e.target.value });
                  }}
                  placeholder="auto-generated-from-title"
                  className={inputMonoCls}
                  dir="ltr"
                />
              </AdminField>
            </div>

            <AdminField label="excerpt">
              <textarea
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                rows={2}
                placeholder="One or two sentences shown in cards and search results."
                className={cn(inputCls, "resize-y")}
              />
            </AdminField>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="category">
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value as PostCategory })
                  }
                  className={inputCls}
                >
                  {POST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="cover url (optional)">
                <input
                  value={draft.cover_url}
                  onChange={(e) => setDraft({ ...draft, cover_url: e.target.value })}
                  placeholder="https://…"
                  className={inputMonoCls}
                  dir="ltr"
                />
              </AdminField>
            </div>

            <AdminField label="content (markdown)">
              <textarea
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                rows={16}
                placeholder={"## Heading\n\nWrite in Markdown. ```cisco blocks``` for CLI snippets."}
                className={cn(inputMonoCls, "resize-y leading-relaxed")}
                dir="auto"
              />
            </AdminField>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-static">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                className="h-4 w-4 rounded border-line accent-[#38e1ff]"
              />
              published (visible on the public blog)
            </label>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-field border border-fault/30 bg-fault/5 px-3.5 py-2.5 font-mono text-xs text-fault" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDraft(null)}
            className="rounded-field border border-line px-4 py-2 text-sm text-static transition-colors hover:text-ink"
          >
            cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-field bg-signal px-5 py-2 text-sm font-semibold text-terminal transition-colors hover:bg-[#5ce9ff] disabled:opacity-60"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {draft.id ? "save changes" : "create post"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-faint">
          {loading ? "loading…" : `${posts.length} posts`}
        </p>
        <button
          onClick={() => {
            setSlugTouched(false);
            setDraft({ ...EMPTY_DRAFT });
            setError(null);
          }}
          className="flex items-center gap-2 rounded-field bg-signal/15 px-3.5 py-2 font-mono text-xs text-signal transition-colors hover:bg-signal/25"
        >
          <Plus size={13} /> new post
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-card border border-line bg-panel"
            />
          ))}

        {!loading && posts.length === 0 && (
          <div className="rounded-card border border-dashed border-line bg-rack/50 p-10 text-center">
            <p className="text-sm text-static">
              No posts yet — the seed file or this button can create the first one.
            </p>
          </div>
        )}

        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between gap-3 rounded-card border border-line bg-rack px-4 py-3.5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    post.published ? "bg-ok" : "bg-warn",
                  )}
                  title={post.published ? "published" : "draft"}
                />
                <p className="truncate text-sm font-medium text-ink">
                  {post.title}
                </p>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-faint">
                {post.category} · {formatDate(post.created_at)} · /{post.slug}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => edit(post)}
                className="rounded-md px-2.5 py-1 font-mono text-xs text-static transition-colors hover:text-signal"
              >
                edit
              </button>
              <ConfirmButton onConfirm={() => remove(post.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── questions tab ───────────────────────────────────────────────── */

interface QuestionDraft {
  id: string | null;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  topic: string;
  difficulty: 1 | 2 | 3;
}

const EMPTY_QUESTION: QuestionDraft = {
  id: null,
  question: "",
  options: ["", "", "", ""],
  correct_index: 0,
  explanation: "",
  topic: "OSI",
  difficulty: 1,
};

function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<QuestionDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });
    setQuestions((data ?? []) as Question[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!draft) return;
    if (!draft.question.trim()) {
      setError("The question text is required.");
      return;
    }
    if (draft.options.some((o) => !o.trim())) {
      setError("All four options need text.");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const row = {
      question: draft.question.trim(),
      options: draft.options.map((o) => o.trim()),
      correct_index: draft.correct_index,
      explanation: draft.explanation.trim(),
      topic: draft.topic.trim() || "General",
      difficulty: draft.difficulty,
    };

    const { error: err } = draft.id
      ? await supabase.from("questions").update(row).eq("id", draft.id)
      : await supabase.from("questions").insert(row);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    setDraft(null);
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("questions").delete().eq("id", id);
    load();
  };

  if (draft) {
    return (
      <div className="rounded-card border border-line bg-rack p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          {draft.id ? "Edit question" : "New question"}
        </h3>

        <div className="mt-5 flex flex-col gap-4">
          <AdminField label="question">
            <textarea
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
              rows={2}
              placeholder="What is the broadcast address of 192.168.10.37/27?"
              className={cn(inputCls, "resize-y")}
            />
          </AdminField>

          {draft.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 pt-1">
                <input
                  type="radio"
                  name="correct"
                  checked={draft.correct_index === i}
                  onChange={() => setDraft({ ...draft, correct_index: i })}
                  className="h-4 w-4 accent-[#3ddc97]"
                  aria-label={`Mark option ${i + 1} as correct`}
                />
              </label>
              <div className="flex-1">
                <input
                  value={opt}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      options: draft.options.map((o, j) =>
                        j === i ? e.target.value : o,
                      ),
                    })
                  }
                  placeholder={`Option ${i + 1}`}
                  className={inputMonoCls}
                  dir="auto"
                />
              </div>
            </div>
          ))}
          <p className="font-mono text-[11px] text-faint">
            select the radio next to the correct answer
          </p>

          <AdminField label="explanation (shown after answering)">
            <textarea
              value={draft.explanation}
              onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
              rows={3}
              placeholder="Why is this the answer — the math or the rule."
              className={cn(inputCls, "resize-y")}
            />
          </AdminField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="topic">
              <input
                value={draft.topic}
                onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                placeholder="OSI, TCP/IP, Routing, Wi-Fi, 5G, Security…"
                className={inputCls}
              />
            </AdminField>
            <AdminField label="difficulty">
              <select
                value={draft.difficulty}
                onChange={(e) =>
                  setDraft({ ...draft, difficulty: Number(e.target.value) as 1 | 2 | 3 })
                }
                className={inputCls}
              >
                <option value={1}>1 — easy</option>
                <option value={2}>2 — medium</option>
                <option value={3}>3 — hard</option>
              </select>
            </AdminField>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-field border border-fault/30 bg-fault/5 px-3.5 py-2.5 font-mono text-xs text-fault" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDraft(null)}
            className="rounded-field border border-line px-4 py-2 text-sm text-static transition-colors hover:text-ink"
          >
            cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-field bg-signal px-5 py-2 text-sm font-semibold text-terminal transition-colors hover:bg-[#5ce9ff] disabled:opacity-60"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {draft.id ? "save changes" : "add question"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-faint">
          {loading ? "loading…" : `${questions.length} questions in the bank`}
        </p>
        <button
          onClick={() => {
            setDraft({ ...EMPTY_QUESTION });
            setError(null);
          }}
          className="flex items-center gap-2 rounded-field bg-signal/15 px-3.5 py-2 font-mono text-xs text-signal transition-colors hover:bg-signal/25"
        >
          <Plus size={13} /> new question
        </button>
      </div>

      <div className="mt-4 flex max-h-[560px] flex-col gap-2 overflow-y-auto pr-1">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-card border border-line bg-panel"
            />
          ))}

        {!loading && questions.length === 0 && (
          <div className="rounded-card border border-dashed border-line bg-rack/50 p-10 text-center">
            <p className="text-sm text-static">
              The question bank is empty — run the seed file or add the first
              question.
            </p>
          </div>
        )}

        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-card border border-line bg-rack px-4 py-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-sm text-ink">
                {q.question}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() =>
                    setDraft({
                      id: q.id,
                      question: q.question,
                      options: q.options,
                      correct_index: q.correct_index,
                      explanation: q.explanation,
                      topic: q.topic,
                      difficulty: q.difficulty,
                    })
                  }
                  className="rounded-md px-2.5 py-1 font-mono text-xs text-static transition-colors hover:text-signal"
                >
                  edit
                </button>
                <ConfirmButton onConfirm={() => remove(q.id)} />
              </div>
            </div>
            <p className="mt-1 font-mono text-[11px] text-faint">
              {q.topic} · difficulty {q.difficulty}/3 · correct:{" "}
              <span className="text-ok">{q.options[q.correct_index]}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── results tab ─────────────────────────────────────────────────── */

interface ResultRowData extends QuizResult {
  name: string;
}

function ResultsTab() {
  const [rows, setRows] = useState<ResultRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const [{ data: results, error: err }, { data: profiles }] = await Promise.all([
      supabase
        .from("quiz_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("profiles").select("id, display_name"),
    ]);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const names = new Map<string, string>(
      (profiles ?? []).map((p: { id: string; display_name: string }) => [p.id, p.display_name]),
    );
    setRows(
      ((results ?? []) as QuizResult[]).map((r) => ({
        ...r,
        name: names.get(r.user_id) ?? "unknown",
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-faint">
          {loading ? "loading…" : `latest ${rows.length} runs (newest first)`}
        </p>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-field border border-line px-3.5 py-2 font-mono text-xs text-static transition-colors hover:border-signal/40 hover:text-signal"
        >
          <RefreshCw size={12} /> refresh
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-field border border-fault/30 bg-fault/5 px-3.5 py-2.5 font-mono text-xs text-fault">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-card border border-line">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-rack-hi text-left font-mono text-[11px] uppercase tracking-wider text-static">
              <th className="px-3.5 py-2.5 font-medium">student</th>
              <th className="px-3.5 py-2.5 font-medium">mode</th>
              <th className="px-3.5 py-2.5 font-medium">score</th>
              <th className="px-3.5 py-2.5 font-medium">%</th>
              <th className="px-3.5 py-2.5 font-medium">date</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs sm:text-[13px]">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-line">
                  <td colSpan={5} className="px-3.5 py-3">
                    <div className="h-3 w-full animate-pulse rounded bg-panel" />
                  </td>
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr className="border-t border-line">
                <td colSpan={5} className="px-3.5 py-8 text-center text-sm text-static">
                  No saved runs yet — students&apos; scores appear here once
                  they finish a quiz while signed in.
                </td>
              </tr>
            )}

            {rows.map((r) => {
              const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
              return (
                <tr key={r.id} className="border-t border-line text-ink odd:bg-panel/40">
                  <td className="px-3.5 py-2.5">{r.name}</td>
                  <td className="px-3.5 py-2.5 text-static">{r.mode}</td>
                  <td className="px-3.5 py-2.5">
                    {formatInt(r.score)} / {formatInt(r.total)}
                  </td>
                  <td
                    className={cn(
                      "px-3.5 py-2.5",
                      pct >= 70 ? "text-ok" : pct >= 40 ? "text-warn" : "text-fault",
                    )}
                  >
                    {pct}%
                  </td>
                  <td className="px-3.5 py-2.5 text-static">
                    {formatDate(r.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── shell ───────────────────────────────────────────────────────── */

type TabId = "posts" | "questions" | "results";

export function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("posts");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang="en" t={{ subnet: "Subnet", formulas: "Formulas", quiz: "Quiz", blog: "Blog", signIn: "Sign in", admin: "admin", signOut: "Sign out", openMenu: "Open menu", closeMenu: "Close menu", langLabel: "Language" }} />
      <main id="main-content" className="relative flex-1">
        <div className="bg-grid grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-5 py-14">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
            control room
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Admin
          </h1>

          <div role="tablist" aria-label="Admin sections" className="mt-8 flex gap-1 border-b border-line pb-px">
            <TabButton
              active={tab === "posts"}
              onClick={() => setTab("posts")}
              icon={<FileText size={15} />}
              label="Posts"
            />
            <TabButton
              active={tab === "questions"}
              onClick={() => setTab("questions")}
              icon={<HelpCircle size={15} />}
              label="Questions"
            />
            <TabButton
              active={tab === "results"}
              onClick={() => setTab("results")}
              icon={<Table2 size={15} />}
              label="Results"
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6"
            >
              {tab === "posts" && <PostsTab />}
              {tab === "questions" && <QuestionsTab />}
              {tab === "results" && <ResultsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
