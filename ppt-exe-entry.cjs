"use strict";
/**
 * Windows용 단일 exe(pkg) 진입점.
 * 더블클릭 시 콘솔이 열리고 주제를 물은 뒤 auto_ppt.cjs 를 실행합니다.
 */
const path = require("path");
const readline = require("readline");

if (process.pkg) {
  process.env.AUTO_PPT_APP_ROOT = path.dirname(process.execPath);
}

function askLine(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (line) => {
      rl.close();
      resolve(line);
    });
  });
}

(async function main() {
  let topic = (process.argv[2] || "").trim();
  if (!topic) {
    topic = (await askLine("PPT 주제(제목)을 입력하고 Enter: ")).trim();
  }
  if (!topic) {
    console.error("주제가 비었습니다.");
    process.exit(1);
  }
  process.argv[2] = topic;
  require("./auto_ppt.cjs");
})();
