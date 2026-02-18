import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QA_APPROVAL_ROOT = path.resolve(__dirname, "../qa/approvals");
const REVIEW_ROOT = path.resolve(__dirname, "../../../generated/review");
const PROMOTION_ROOT = path.resolve(__dirname, "../../../generated/promotion");

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function assertArg(name, value) {
  if (!value) {
    throw new Error(`Missing required argument: ${name}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function copyFileSafe(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }
  fs.copyFileSync(sourcePath, destinationPath);
}

function ensureApproval(level, dialect, unit) {
  const approvalPath = path.join(QA_APPROVAL_ROOT, `${level}-${dialect}-u${unit}.json`);
  if (!fs.existsSync(approvalPath)) {
    throw new Error(`Approval file not found: ${approvalPath}`);
  }

  const approval = readJson(approvalPath);
  if (approval.status !== "approved") {
    throw new Error(`Approval status must be 'approved' before promotion: ${approvalPath}`);
  }

  return { approval, approvalPath };
}

function ensureApprovalCoverage(cards, approval) {
  const rejected = new Set(approval.rejectedCardIds || []);
  if (rejected.size > 0) {
    const sample = [...rejected].slice(0, 5).join(", ");
    throw new Error(`Promotion blocked: rejected cards present in approval file (${sample}).`);
  }

  const approved = new Set(approval.approvedCardIds || []);
  if (approved.size === 0) {
    throw new Error("Promotion blocked: approval file has no approvedCardIds.");
  }

  const missing = cards.filter((card) => !approved.has(card.cardId));
  if (missing.length > 0) {
    const sample = missing.slice(0, 5).map((card) => card.cardId).join(", ");
    throw new Error(
      `Promotion blocked: ${missing.length} card(s) missing from approvedCardIds. Example: ${sample}`
    );
  }
}

function main() {
  const level = getArg("--level");
  const dialect = getArg("--dialect");
  const unitRaw = getArg("--unit");
  const unit = Number(unitRaw);

  assertArg("--level", level);
  assertArg("--dialect", dialect);
  assertArg("--unit", unitRaw);
  if (!Number.isInteger(unit) || unit <= 0) {
    throw new Error(`Invalid --unit value '${unitRaw}'. Expected a positive integer.`);
  }

  const reviewDir = path.join(REVIEW_ROOT, level, dialect, `unit${unit}`);
  const promotionDir = path.join(PROMOTION_ROOT, level, dialect, `unit${unit}`);
  const canonicalPath = path.join(reviewDir, "cards.canonical.json");
  const csvPath = path.join(reviewDir, "cards.review.csv");
  const reportPath = path.join(reviewDir, "qa-report.md");

  if (!fs.existsSync(reviewDir)) {
    throw new Error(`Review output not found: ${reviewDir}`);
  }

  const cards = readJson(canonicalPath);
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error(`Canonical card output is empty: ${canonicalPath}`);
  }

  const approvalResult = ensureApproval(level, dialect, unit);
  ensureApprovalCoverage(cards, approvalResult.approval);

  fs.mkdirSync(promotionDir, { recursive: true });
  copyFileSafe(canonicalPath, path.join(promotionDir, "cards.canonical.json"));
  copyFileSafe(csvPath, path.join(promotionDir, "cards.review.csv"));
  copyFileSafe(reportPath, path.join(promotionDir, "qa-report.md"));
  copyFileSafe(approvalResult.approvalPath, path.join(promotionDir, "approval.json"));

  const promotionManifest = {
    level,
    dialect,
    unit,
    promotedAt: new Date().toISOString(),
    cardCount: cards.length,
    sourceReviewDir: reviewDir,
    approvalFile: approvalResult.approvalPath,
    runtimeNote:
      "Promotion output is review-ready only. Runtime remains manual-CSV-only until explicit policy change.",
  };

  fs.writeFileSync(
    path.join(promotionDir, "promotion-manifest.json"),
    `${JSON.stringify(promotionManifest, null, 2)}\n`,
    "utf8"
  );

  console.log(`Promotion package created: ${promotionDir}`);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
