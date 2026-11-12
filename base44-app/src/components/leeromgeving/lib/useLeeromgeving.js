import { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { loadContent, loadMyState } from "./api";
import { canSeeLesson, canSeeTrack, moduleUnlock, sequentialLocked, trackSchedule, userField } from "./access";

// Laadt gebruiker + content + eigen voortgang, en bouwt daar een kant-en-klare structuur van.
export default function useLeeromgeving() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(null);
  const [mine, setMine] = useState({ progress: [], submissions: [] });
  const [loading, setLoading] = useState(true);

  const refreshMine = useCallback(async (u) => {
    setMine(await loadMyState(u || user));
  }, [user]);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const [c, m] = await Promise.all([loadContent(), loadMyState(me)]);
      setUser(me);
      setContent(c);
      setMine(m);
      setLoading(false);
    })();
  }, []);

  const derived = useMemo(() => {
    if (!content || !user) return null;
    const doneIds = new Set(mine.progress.map((p) => p.les_id));
    const cohort = content.cohorts.find((c) => c.key === userField(user, "apex_cohort"));
    const assignmentsById = Object.fromEntries(content.assignments.map((a) => [a.id, a]));
    const submissionsByAssignment = {};
    for (const s of mine.submissions) {
      (submissionsByAssignment[s.opdracht_id] ||= []).push(s);
    }

    const tracks = content.tracks.filter((t) => canSeeTrack(t, user)).map((track) => {
      const schedule = trackSchedule(track, cohort, user);
      const modules = content.modules
        .filter((m) => m.track_key === track.key)
        .map((m) => {
          const lessons = content.lessons.filter((l) => l.module_id === m.id && canSeeLesson(l, user));
          return { ...m, lessons, unlock: moduleUnlock(m, track, schedule, user) };
        })
        .filter((m) => m.lessons.length > 0);
      const ordered = modules.flatMap((m) => m.lessons);
      const lessonState = {};
      for (const m of modules) {
        for (const l of m.lessons) {
          const seqLocked = sequentialLocked(track, ordered, l, doneIds, user);
          lessonState[l.id] = {
            done: doneIds.has(l.id),
            locked: !m.unlock.open || seqLocked,
            reason: !m.unlock.open ? "week" : seqLocked ? "volgorde" : null,
            module: m,
          };
        }
      }
      const done = ordered.filter((l) => doneIds.has(l.id)).length;
      const videos = ordered.filter((l) => l.vimeo_id || l.video_url).length;
      const minutes = ordered.reduce((n, l) => n + (l.duration_min || 0), 0);
      return { ...track, schedule, modules, ordered, lessonState, done, total: ordered.length, videos, minutes };
    });

    const lockedTracks = content.tracks.filter((t) => t.published && !canSeeTrack(t, user));
    const lessonIndex = {};
    for (const t of tracks) for (const l of t.ordered) lessonIndex[l.id] = { lesson: l, track: t, ...t.lessonState[l.id] };

    return { tracks, lockedTracks, lessonIndex, doneIds, cohort, assignmentsById, submissionsByAssignment };
  }, [content, user, mine]);

  return { loading, user, content, mine, derived, refreshMine };
}
