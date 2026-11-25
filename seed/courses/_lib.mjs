// Utilitários comuns aos cursos da Onda 1.
// "§" vira crase no final (evita conflito com template literals do arquivo-fonte).
export const NOW = '2026-11-17T22:00:00.000Z';
export const NEXT_REVIEW = '2027-05-17';

export function fix(o) {
  if (typeof o === 'string') return o.replace(/§/g, '`');
  if (Array.isArray(o)) return o.map(fix);
  if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = fix(o[k]); return r; }
  return o;
}

const editorial = { status: 'published', version: 1, updatedAt: NOW, publishedAt: NOW, approvedAt: NOW, approvedBy: 'administrador', lastReviewedAt: NOW, nextReviewAt: NEXT_REVIEW };

/* Monta um curso completo no formato da base (o mesmo do curso piloto). */
export function makeCourse({ course, lessons, exsets, assessment, project }) {
  const ids = course.modules.flatMap((m) => m.lessons);
  lessons.forEach((l) => { if (!ids.includes(l.id)) throw new Error('aula fora dos módulos: ' + l.id); });
  ids.forEach((id) => { if (!lessons.find((l) => l.id === id)) throw new Error('aula ausente: ' + id); if (!exsets[id]) throw new Error('exercícios ausentes: ' + id); });
  return fix({
    course: { ...course, ...editorial },
    lessons: lessons.map((l) => ({ techVersions: course.versions, ...l, courseId: course.id, ...editorial })),
    exsets: Object.fromEntries(Object.entries(exsets).map(([k, v]) => [k, { lessonId: k, items: v, ...editorial }])),
    assessment: { ...assessment, courseId: course.id, ...editorial },
    project: { ...project, courseId: course.id, ...editorial }
  });
}
