import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { createAdminApiMiddleware, saveCardPatch } from "./adminApi";

async function setupTempRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), "mt-admin-"));
  await mkdir(path.join(root, "public", "data", "Mynediad-De", "packs"), {
    recursive: true,
  });
  return root;
}

function makeCanonicalCsv(rows) {
  const header =
    "CardId,RuleFamily,RuleCategory,Trigger,Base,Translate,WordCategory,Before,After,Answer,Outcome,TranslateSent,Why,Why-Cym";
  return `${header}\n${rows.join("\n")}`;
}

async function runMiddleware(middleware, { method, url, body, cookie }) {
  const req = new PassThrough();
  req.method = method;
  req.url = url;
  req.headers = {
    "content-type": "application/json",
    ...(cookie ? { cookie } : {}),
  };

  let ended = false;
  const response = await new Promise((resolve) => {
    const headers = {};
    const res = {
      statusCode: 200,
      setHeader(name, value) {
        headers[name] = value;
      },
      end(chunk) {
        if (ended) return;
        ended = true;
        const text = chunk ? String(chunk) : "";
        let json = {};
        try {
          json = text ? JSON.parse(text) : {};
        } catch {
          json = {};
        }
        resolve({ statusCode: this.statusCode, headers, body: text, json, nextCalled: false });
      },
    };

    Promise.resolve(middleware(req, res, () => resolve({ statusCode: null, headers, body: "", json: {}, nextCalled: true }))).catch(
      (error) =>
        resolve({
          statusCode: 500,
          headers,
          body: error?.message || "middleware error",
          json: {},
          nextCalled: false,
        })
    );

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });

  return response;
}

describe("admin api", () => {
  it("requires auth for save-card endpoint", async () => {
    const rootDir = await setupTempRoot();
    const middleware = createAdminApiMiddleware({ rootDir });

    const result = await runMiddleware(middleware, {
      method: "POST",
      url: "/api/admin/save-card",
      body: {
        source: "cards.csv",
        rowIndex: 0,
        expectedCardId: "c1",
        patch: { base: "bara" },
      },
    });

    expect(result.statusCode).toBe(401);
    expect(result.json.error).toMatch(/authentication required/i);
  });

  it("updates a row by source + rowIndex and rejects card mismatch", async () => {
    const rootDir = await setupTempRoot();
    const cardsPath = path.join(rootDir, "public", "data", "cards.csv");

    await writeFile(
      cardsPath,
      makeCanonicalCsv([
        '"c1","Soft","Article","y","cath","cat","noun","Mae\'r "," yn cysgu.","gath","SM","The cat sleeps.","English why","Welsh why"',
        '"c2","None","Article","y","bara","bread","noun","Mae\'r "," yn ffres.","bara","NONE","The bread is fresh.","English why 2","Welsh why 2"',
      ]),
      "utf8"
    );

    await expect(
      saveCardPatch({
        rootDir,
        source: "cards.csv",
        rowIndex: 0,
        expectedCardId: "wrong-id",
        rawPatch: { base: "pen" },
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    const saved = await saveCardPatch({
      rootDir,
      source: "cards.csv",
      rowIndex: 0,
      expectedCardId: "c1",
      rawPatch: { base: "pen", answer: "ben" },
    });

    expect(saved.updatedRow.base).toBe("pen");
    expect(saved.updatedRow.answer).toBe("ben");

    const nextRaw = await readFile(cardsPath, "utf8");
    const parsed = Papa.parse(nextRaw, { header: true, skipEmptyLines: true });
    expect(parsed.data[0].Base).toBe("pen");
    expect(parsed.data[0].Answer).toBe("ben");
  });

  it("preserves TSV delimiter and keeps file parseable after save", async () => {
    const rootDir = await setupTempRoot();
    const tsvPath = path.join(
      rootDir,
      "public",
      "data",
      "Mynediad-De",
      "packs",
      "myn-de-p01-places.tsv"
    );

    const tsv = [
      "pack_id\tcard_seq\tbase\tsentence_with_gap\tSentence_Eng\ttrigger\toutcome (SM/NM/AM/NONE)\tTarget_word\tWhyEng\tWhyCym",
      "myn-de-p01-places\tM-D-00001\tBangor\tDw i'n dod o [ ]\tI come from Bangor\to\tSM\tFangor\tEnglish\tCymraeg",
    ].join("\n");

    await writeFile(tsvPath, tsv, "utf8");

    const saved = await saveCardPatch({
      rootDir,
      source: "Mynediad-De/packs/myn-de-p01-places.tsv",
      rowIndex: 0,
      expectedCardId: "M-D-00001",
      rawPatch: {
        before: "Dw i'n dod o",
        after: "yn aml",
        outcome: "nasal",
        answer: "Mangor",
      },
    });

    expect(saved.updatedRow.outcome).toBe("nasal");
    expect(saved.updatedRow.answer).toBe("Mangor");

    const nextRaw = await readFile(tsvPath, "utf8");
    expect(nextRaw).toContain("\t");

    const parsed = Papa.parse(nextRaw, {
      header: true,
      skipEmptyLines: true,
      delimiter: "\t",
    });

    expect(parsed.errors).toHaveLength(0);
    expect(parsed.data[0].sentence_with_gap).toBe("Dw i'n dod o [ ] yn aml");
    expect(parsed.data[0]["outcome (SM/NM/AM/NONE)"]).toBe("NM");
    expect(parsed.data[0].Target_word).toBe("Mangor");
  });
});
