// Updated OpeningSelector – binary chapter completion and progress bar
"use client";

import { openingCourses, type OpeningCourse } from "@/lib/data/openings";
import { useRepertoire } from "@/hooks/useRepertoire";

type OpeningSelectorProps = {
  onSelectOpening: (id: string) => void;
};

export function OpeningSelector({ onSelectOpening }: OpeningSelectorProps) {
  const { completedChapters } = useRepertoire();

  return (
    <section className="flex h-full flex-col gap-3">
      <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
        Apprendre une ouverture
      </h2>

      <ul className="space-y-3">
        {openingCourses.map((course: OpeningCourse) => {
          const completedCount = course.chapters.filter((ch) => completedChapters.includes(ch.id)).length;
          const total = course.chapters.length;
          const progressRatio = total > 0 ? completedCount / total : 0;
          const progressPercent = Math.round(progressRatio * 100);
          return (
            <li key={course.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
              <p className="text-sm font-semibold text-slate-100">{course.name}</p>
              <p className="mt-1 text-xs text-slate-400">{course.description}</p>
              <div className="mt-2 w-full bg-slate-700 h-2 rounded">
                <div className="h-2 bg-emerald-500 rounded" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-400">{completedCount}/{total} Chapitres complétés</p>
              <ul className="mt-2 space-y-1">
                {course.chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      onClick={() => onSelectOpening(chapter.id)}
                      className="w-full rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/80 hover:bg-emerald-500/30"
                    >
                      {chapter.name}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
