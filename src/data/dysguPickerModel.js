const DIALECT_ORDER = ["south", "north"];

function toNumberOrInfinity(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function getNumericUnit(unitEntry) {
  return toNumberOrInfinity(unitEntry?.criteria?.unit);
}

export function getDysguCourses(courses = []) {
  return courses.filter((course) => course?.isDysgu !== false);
}

export function getDialectsForCourse(course) {
  if (!course) return [];

  const dialectsWithUnits = new Set(
    (course.units || [])
      .filter((entry) => !entry?.isPack && typeof entry?.criteria?.dialect === "string")
      .map((entry) => entry.criteria.dialect)
  );

  if (dialectsWithUnits.size === 0) return [];

  const ordered = DIALECT_ORDER.filter((dialect) => dialectsWithUnits.has(dialect));
  const remaining = Array.from(dialectsWithUnits).filter((dialect) => !DIALECT_ORDER.includes(dialect));
  return [...ordered, ...remaining];
}

export function getUnitsForCourseDialect(course, dialect) {
  if (!course || !dialect) return [];

  return (course.units || [])
    .filter((entry) => !entry?.isPack && entry?.criteria?.dialect === dialect)
    .sort((a, b) => getNumericUnit(a) - getNumericUnit(b));
}

export function findUnitByPresetId(courses = [], presetId) {
  if (!presetId) return null;

  for (const course of getDysguCourses(courses)) {
    const unit = (course.units || []).find(
      (entry) => !entry?.isPack && entry?.id === presetId
    );
    if (unit) {
      return { course, unit };
    }
  }

  return null;
}
