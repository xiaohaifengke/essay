# Interview Answer Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a repo-local skill that turns Markdown filenames into concise interview answers, while respecting the “preview before editing non-empty files” rule.

**Architecture:** Create a new private skill under `.codex/skills/interview-answer-writer/` using the official skill scaffolding script, then customize `SKILL.md`, add a lightweight style reference, and validate the skill with the official validator. Keep the skill repo-specific by hard-coding the target directories and the explicit-invocation behavior in the description and body.

**Tech Stack:** Markdown, Codex Skills, Python helper scripts from `skill-creator`

---

### Task 1: Scaffold the skill folder

**Files:**
- Create: `.codex/skills/interview-answer-writer/SKILL.md`
- Create: `.codex/skills/interview-answer-writer/agents/openai.yaml`
- Create: `.codex/skills/interview-answer-writer/references/`

**Step 1: Initialize the skill skeleton**

Run:

```bash
python3 /Users/Jhail/.codex/skills/.system/skill-creator/scripts/init_skill.py \
  interview-answer-writer \
  --path .codex/skills \
  --resources references \
  --interface display_name="Interview Answer Writer" \
  --interface short_description="根据题目文件名生成精炼面试答案" \
  --interface default_prompt="Use $interview-answer-writer to generate or extend an interview-answer Markdown file in this repo."
```

**Step 2: Verify the scaffold exists**

Run:

```bash
find .codex/skills/interview-answer-writer -maxdepth 2 -type f | sort
```

Expected: shows `SKILL.md` and `agents/openai.yaml`, plus the `references/` directory.

### Task 2: Write the repo-specific skill rules

**Files:**
- Modify: `.codex/skills/interview-answer-writer/SKILL.md`

**Step 1: Replace the template frontmatter and body**

Write `SKILL.md` so that it explicitly covers:

- use only when the user explicitly names the skill;
- default target scope is `面试准备/` Markdown files in this repo;
- treat the filename as the interview question;
- write directly only when the file is empty;
- preview changes first when the file already has content;
- use the fixed output structure `回答 / 面试官追问 / 可举的项目例子 / 易踩坑`;
- keep answers concise, spoken, and interview-ready rather than encyclopedic.

**Step 2: Add handling for special cases**

Add explicit instructions for:

- self-introduction and project-experience prompts that need one clarifying question;
- generating 3–5 layers of follow-up questions;
- avoiding fabricated personal experience;
- asking for confirmation before modifying non-empty files.

**Step 3: Manually review the final wording**

Check that the description is strong enough to trigger only for explicit usage, and that the body is concise rather than over-explaining common knowledge.

### Task 3: Add the style guide reference

**Files:**
- Create: `.codex/skills/interview-answer-writer/references/style-guide.md`

**Step 1: Add compact output guidance**

Document a short reference covering:

- ideal answer length for first response;
- how to write spoken Chinese bullets;
- how to structure “why / how / trade-off / metric / example” follow-ups;
- how to avoid verbose textbook phrasing.

**Step 2: Add one positive and one negative example**

Include:

- a good short interview answer example;
- an overly long bad example and why it should be avoided.

### Task 4: Validate the skill

**Files:**
- Modify: `.codex/skills/interview-answer-writer/SKILL.md`
- Modify: `.codex/skills/interview-answer-writer/agents/openai.yaml`
- Modify: `.codex/skills/interview-answer-writer/references/style-guide.md`

**Step 1: Run the validator**

Run:

```bash
python3 /Users/Jhail/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .codex/skills/interview-answer-writer
```

Expected: validation passes with no YAML/frontmatter errors.

**Step 2: Fix any validation issues**

If validation fails, adjust only the reported structure or metadata issues and rerun the validator.

**Step 3: Smoke-check the skill content**

Run:

```bash
sed -n '1,220p' .codex/skills/interview-answer-writer/SKILL.md
```

Expected: the instructions are concise, repo-specific, and clearly encode the edit-safety rule.

### Task 5: Document usage for this repo

**Files:**
- Modify: `docs/plans/2026-03-09-interview-answer-skill-design.md`

**Step 1: Append invocation examples**

Add 2–3 example prompts showing how to explicitly invoke the skill, such as:

- asking it to fill an empty question file;
- asking it to preview additions for a non-empty file;
- asking it to continue adding interviewer follow-up questions.

**Step 2: Final manual review**

Check that the examples match the rules in `SKILL.md` and do not imply implicit invocation.
