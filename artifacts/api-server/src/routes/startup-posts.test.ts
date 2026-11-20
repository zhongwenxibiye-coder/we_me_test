import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import express from "express";
import startupPostsRouter from "./startup-posts";
import { database, seedStartupPosts } from "../test-support/startup-posts-db.ts";

const app = express();
app.use("/api", startupPostsRouter);
const server = app.listen(0, "127.0.0.1");
let baseUrl: string;

before(async () => {
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  await seedStartupPosts();
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  await database.close();
});

async function getPostIds(query = ""): Promise<number[]> {
  const response = await fetch(`${baseUrl}/api/startup-posts${query}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  const rows = await response.json() as { id: number }[];
  assert.ok(Array.isArray(rows));
  return rows.map((row) => row.id);
}

for (const [description, instant, expectedIds] of [
  ["마감 전날 시작", "2026-09-27T15:00:00.000Z", [2, 6, 1]],
  ["마감 당일 시작", "2026-09-28T15:00:00.000Z", [2, 6, 1]],
  ["마감 당일 마지막 순간", "2026-09-29T14:59:59.999Z", [2, 6, 1]],
  ["마감 다음날 시작", "2026-09-29T15:00:00.000Z", [2, 6]],
] as const) {
  test(`GET /startup-posts: 한국 시간 ${description}`, async (t) => {
    t.mock.method(Date, "now", () => Date.parse(instant));

    // Exact IDs also verify: no-deadline posts stay open, manually disabled
    // posts never leak through, expired posts disappear, and ordering is stable.
    assert.deepEqual(await getPostIds(), expectedIds);
    assert.deepEqual(await getPostIds("?includeClosed=false"), expectedIds);
  });

  test(`includeClosed=true: ${description}에도 마감·비활성·날짜 없는 공고를 모두 반환`, async (t) => {
    t.mock.method(Date, "now", () => Date.parse(instant));
    assert.deepEqual(await getPostIds("?includeClosed=true"), [3, 5, 2, 4, 6, 1]);
  });
}

test("includeClosed는 정확히 true일 때만 필터를 해제한다", async (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-09-29T15:00:00.000Z"));
  for (const query of ["?includeClosed=", "?includeClosed=1", "?includeClosed=TRUE"]) {
    assert.deepEqual(await getPostIds(query), [2, 6]);
  }
});
