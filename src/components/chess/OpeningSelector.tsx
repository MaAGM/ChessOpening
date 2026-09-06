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

        {/* Scrollable grid container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {openingCourses.map((course: OpeningCourse) => {
            const completedCount = course.chapters.filter((ch) => completedChapters.includes(ch.id)).length;
            const total = course.chapters.length;
            const progressRatio = total > 0 ? completedCount / total : 0;
            const progressPercent = Math.round(progressRatio * 100);
            return (
              <div key={course.id} className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-emerald-500 cursor-pointer transition-all duration-200">
                <p className="text-sm font-bold text-white mb-1">{course.name}</p>
                <p className="text-xs text-slate-400 mb-2">{course.description}</p>
                <div className="w-full bg-slate-700 h-2 rounded mb-1">
                  <div className="h-2 bg-emerald-500 rounded" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs text-slate-400 mb-2">{completedCount}/{total} Chapitres complétés</p>
                <div className="space-y-1">
                  {course.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => onSelectOpening(chapter.id)}
                      className="w-full rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/80 hover:bg-emerald-500/30"
                    >
                      {chapter.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
}