const COURSE_TRANSLATION_KEY_BY_ID = {
  mynediad: "courseMynediad",
  sylfaen: "courseSylfaen",
  canolradd: "courseCanolradd",
  uwch: "courseUwch",
};

function canon(value) {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function titleCase(value) {
  return String(value ?? "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function inferCourseFromSource(sourceFile) {
  const src = (sourceFile ?? "").toString().toLowerCase();
  if (src.includes("mynediad")) return "mynediad";
  if (src.includes("sylfaen")) return "sylfaen";
  if (src.includes("canolradd")) return "canolradd";
  if (src.includes("uwch")) return "uwch";
  return "";
}

function getCourseLabel(course, level, sourceFile, t) {
  const courseId = canon(level || course || inferCourseFromSource(sourceFile));
  if (!courseId) return null;

  const translationKey = COURSE_TRANSLATION_KEY_BY_ID[courseId];
  if (translationKey) {
    return t(translationKey);
  }

  return titleCase(level || course || courseId);
}

function getUnitLabel(unit, t) {
  const rawUnit = String(unit ?? "").trim();
  if (!rawUnit) return null;

  const unitPrefix = t("unitPrefix") || "Unit";
  return `${unitPrefix} ${rawUnit}`;
}

export function deriveDysguBadges({ course, level, unit, sourceFile, t }) {
  const courseLabel = getCourseLabel(course, level, sourceFile, t);
  const unitLabel = getUnitLabel(unit, t);

  if (!courseLabel && !unitLabel) return null;
  return { courseLabel, unitLabel };
}
