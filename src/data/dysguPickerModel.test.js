import { describe, expect, it } from "vitest";
import { COURSES } from "./courses";
import {
  findUnitByPresetId,
  getDialectsForCourse,
  getDysguCourses,
  getUnitsForCourseDialect,
} from "./dysguPickerModel";

describe("dysguPickerModel", () => {
  it("returns only Dysgu courses", () => {
    const courses = getDysguCourses(COURSES);
    expect(courses.every((course) => course.isDysgu !== false)).toBe(true);
    expect(courses.some((course) => course.id === "core")).toBe(false);
  });

  it("returns ordered dialects for a course", () => {
    const uwch = COURSES.find((course) => course.id === "uwch");
    expect(getDialectsForCourse(uwch)).toEqual(["south", "north"]);
  });

  it("returns sorted units per dialect and keeps coming-soon visible", () => {
    const uwch = COURSES.find((course) => course.id === "uwch");
    const southUnits = getUnitsForCourseDialect(uwch, "south");
    expect(southUnits.map((unit) => unit.id)).toEqual(["uwch-south-u1", "uwch-south-u2"]);

    const northUnits = getUnitsForCourseDialect(uwch, "north");
    expect(northUnits.map((unit) => unit.id)).toEqual(["uwch-north-u1"]);
    expect(northUnits[0].status).toBe("coming-soon");
  });

  it("finds active unit metadata by preset id", () => {
    const match = findUnitByPresetId(COURSES, "uwch-south-u1");
    expect(match).toBeTruthy();
    expect(match.course.id).toBe("uwch");
    expect(match.unit.criteria.dialect).toBe("south");
    expect(match.unit.criteria.unit).toBe(1);
  });

  it("returns null for non-Dysgu presets", () => {
    const match = findUnitByPresetId(COURSES, "starter-preps");
    expect(match).toBeNull();
  });
});
