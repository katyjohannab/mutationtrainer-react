import { describe, expect, it } from "vitest";
import { COURSES } from "./courses";

describe("courses catalog", () => {
  it("keeps core manual course present", () => {
    const core = COURSES.find((course) => course.id === "core");
    expect(core).toBeTruthy();
  });

  it("includes registered dysgu unit entries", () => {
    const uwch = COURSES.find((course) => course.id === "uwch");
    expect(uwch).toBeTruthy();

    const southUnit1 = uwch.units.find((entry) => entry.id === "uwch-south-u1");
    expect(southUnit1).toBeTruthy();
    expect(southUnit1.section).toBe("south-units");
    expect(southUnit1.isSelectable).toBe(true);
  });

  it("includes coming-soon unit entries for future dialect expansion", () => {
    const uwch = COURSES.find((course) => course.id === "uwch");
    const northUnit1 = uwch.units.find((entry) => entry.id === "uwch-north-u1");

    expect(northUnit1).toBeTruthy();
    expect(northUnit1.section).toBe("north-units");
    expect(northUnit1.status).toBe("coming-soon");
    expect(northUnit1.isSelectable).toBe(false);
  });
});
