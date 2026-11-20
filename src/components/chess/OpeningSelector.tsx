"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { useReviewStore } from "@/hooks/useReviewStore";
import { courseEntries, type ChapterIndexEntry, type CourseIndexEntry } from "@/lib/data/openings";
import {
  chapterLessonIds,
  chapterProgress,
  courseProgress,
  firstUnfinishedLessonId,
  STAGE_LABELS,
  type Progress,
} from "@/lib/learning/progress";

const SIDE_LABELS = { white: "Blancs", black: "Noirs" } as const;

function ProgressBar({ progress, label }: { progress: Progress; label: string }) {
  return (
    <div className="w-full">
      <div
        className="h-2 w-full rounded bg-slate-700"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.completed}
      >
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Liste des ouvertures
// ---------------------------------------------------------------------------
function OpeningGrid({ onOpenCourse }: { onOpenCourse: (courseId: string) => void }) {
  const { completedChapters } = useReviewStore();
  const completed = useMemo(() => new Set(completedChapters), [completedChapters]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
        Apprendre une ouverture
      </h2>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4">
        {courseEntries.map((course) => {
          const progress = courseProgress(course, completed);
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => onOpenCourse(course.id)}
              className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-800 p-4 text-left text-white transition-all duration-200 hover:border-emerald-500 hover:bg-slate-700"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold">{course.name}</span>
                <span className="text-xs text-slate-400">{SIDE_LABELS[course.side]}</span>
              </span>
              <span className="text-xs text-slate-400">{course.description}</span>
              <ProgressBar progress={progress} label={`Progression ${course.name}`} />
              <span className="text-xs text-slate-400">
                {course.chapters.length} chapitres · {progress.completed}/{progress.total} cours parcourus
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Vue d'une ouverture : chapitres en accordéon
// ---------------------------------------------------------------------------
type CourseOverviewProps = {
  course: CourseIndexEntry;
  isLoading: boolean;
  loadError: string | null;
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
};

function ChapterSection({
  chapter,
  index,
  open,
  onToggle,
  completed,
  onStartLesson,
  disabled,
}: {
  chapter: ChapterIndexEntry;
  index: number;
  open: boolean;
  onToggle: () => void;
  completed: ReadonlySet<string>;
  onStartLesson: (lessonId: string) => void;
  disabled: boolean;
}) {
  const { isInReview, addManyToReview } = useReviewStore();
  const progress = chapterProgress(chapter, completed);
  const ids = chapterLessonIds(chapter);
  const allInReview = ids.every(isInReview);
  const panelId = `chapter-panel-${chapter.id}`;

  return (
    <li className="rounded-xl border border-slate-700 bg-slate-800/80">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full flex-col gap-2 p-3 text-left"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-100">
            Chapitre {index + 1} · {chapter.title}
          </span>
          <span className="shrink-0 text-xs text-slate-400">
            {progress.completed}/{progress.total} {open ? "▴" : "▾"}
          </span>
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#D4AF37]">
          {STAGE_LABELS[chapter.stage]}
        </span>
        <ProgressBar progress={progress} label={`Progression du chapitre ${index + 1}`} />
      </button>

      {open && (
        <div id={panelId} className="flex flex-col gap-2 border-t border-slate-700 p-3">
          {chapter.summary && <p className="text-xs text-slate-400">{chapter.summary}</p>}
          <ol className="flex flex-col gap-1.5">
            {chapter.lessons.map((lesson, lessonIndex) => {
              const done = completed.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onStartLesson(lesson.id)}
                    className="flex w-full items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-left text-sm text-emerald-50 transition hover:border-emerald-300/80 hover:bg-emerald-500/25 disabled:cursor-wait disabled:opacity-60"
                  >
                    <span
                      aria-label={done ? "Cours parcouru" : "Cours à faire"}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done ? "bg-emerald-500 text-slate-900" : "border border-slate-500 text-slate-400"
                      }`}
                    >
                      {done ? "✓" : lessonIndex + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                    {isInReview(lesson.id) && (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-amber-300">Révision</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          {allInReview ? (
            <Callout tone="success" as="p" className="px-3 py-2 text-xs text-emerald-300">
              ✓ Tout le chapitre est dans vos révisions
            </Callout>
          ) : (
            <Button tone="amber" onClick={() => addManyToReview(ids)} className="px-3 py-2 text-xs">
              Ajouter le chapitre aux révisions
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

function CourseOverview({ course, isLoading, loadError, onBack, onStartLesson }: CourseOverviewProps) {
  const { completedChapters } = useReviewStore();
  const completed = useMemo(() => new Set(completedChapters), [completedChapters]);
  const progress = courseProgress(course, completed);
  const nextId = firstUnfinishedLessonId(course, completed);

  // Chapitre ouvert par défaut : celui du prochain cours à faire (sinon le premier).
  const defaultOpen =
    course.chapters.find((chapter) => nextId && chapterLessonIds(chapter).includes(nextId))?.id ??
    course.chapters[0]?.id;
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set(defaultOpen ? [defaultOpen] : []));
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const nextTitle = nextId
    ? course.chapters.flatMap((c) => c.lessons).find((lesson) => lesson.id === nextId)?.title
    : null;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Button variant="link" onClick={onBack} className="w-fit">
          ← Toutes les ouvertures
        </Button>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-slate-100">{course.name}</h2>
          <span className="text-xs text-slate-400">
            {SIDE_LABELS[course.side]} · {course.eco.join(", ")}
          </span>
        </div>
        <p className="text-xs text-slate-400">{course.description}</p>
        <ProgressBar progress={progress} label={`Progression ${course.name}`} />
        <p className="text-xs text-slate-400">
          {progress.completed}/{progress.total} cours parcourus
        </p>
        {nextId && nextTitle && (
          <Button
            variant="primary"
            disabled={isLoading}
            onClick={() => onStartLesson(nextId)}
            className="text-sm disabled:cursor-wait disabled:opacity-60"
          >
            {progress.completed === 0 ? "Commencer" : "Continuer"} : {nextTitle}
          </Button>
        )}
        {loadError && (
          <Callout tone="danger" as="p" className="p-2 text-xs text-rose-200">
            {loadError}
          </Callout>
        )}
      </div>

      <ol className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {course.chapters.map((chapter, index) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            index={index}
            open={openIds.has(chapter.id)}
            onToggle={() => toggle(chapter.id)}
            completed={completed}
            onStartLesson={onStartLesson}
            disabled={isLoading || loadError !== null}
          />
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------
type OpeningSelectorProps = {
  /** Ouverture affichée (null : liste des ouvertures). */
  selectedCourse: CourseIndexEntry | null;
  isLoading: boolean;
  loadError: string | null;
  onOpenCourse: (courseId: string) => void;
  onCloseCourse: () => void;
  onStartLesson: (lessonId: string) => void;
};

/** Masterclass : liste des ouvertures, puis chapitres et cours d'une ouverture. */
export function OpeningSelector({
  selectedCourse,
  isLoading,
  loadError,
  onOpenCourse,
  onCloseCourse,
  onStartLesson,
}: OpeningSelectorProps) {
  if (!selectedCourse) return <OpeningGrid onOpenCourse={onOpenCourse} />;
  return (
    <CourseOverview
      key={selectedCourse.id}
      course={selectedCourse}
      isLoading={isLoading}
      loadError={loadError}
      onBack={onCloseCourse}
      onStartLesson={onStartLesson}
    />
  );
}
