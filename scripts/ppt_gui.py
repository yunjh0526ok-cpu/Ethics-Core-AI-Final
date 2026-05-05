# -*- coding: utf-8 -*-
"""
Ethics-Core PPT 자동 생성 — Tkinter GUI
- PATH에 node 가 있어야 합니다.
- exe는 보통 바탕 화면에 두며, 같은 위치에 ethics-coreai-웹-앱 폴더(안에 auto_ppt.cjs)가 있어야 합니다.
- PyInstaller: npm run build:ppt-gui
"""
from __future__ import annotations

import json
import os
import queue
import shutil
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

import tkinter as tk
from tkinter import messagebox, scrolledtext, ttk

KEYWORD_PRESETS = [
    "청렴소통법",
    "청렴 실천행동",
    "공익신고자보호",
    "청탁금지법",
    "이해충돌방지",
    "적극행정·면책",
    "공직자 행동강령",
    "부패방지·청렴교육",
    "국민권익위 사례",
    "감사·윤리실무",
    "청렴 리더십",
    "공공데이터·투명성",
    "위반·징계 유형",
    "모범 사례",
    "공공기관 윤리",
    "지자체 청렴",
    "청렴 서약·실천",
]


def find_repo_root() -> Path:
    """
    개발: scripts/ 기준 상위 = 프로젝트 루트.
    exe: 실행 파일과 같은 폴더 안에서 auto_ppt.cjs 가 있는 디렉터리를 찾습니다.
         (이름이 ethics-coreai-웹-앱이 아니어도, 형제 폴더만 있으면 됨)
    환경 변수 ETHICS_CORE_AI_ROOT=프로젝트_절대경로 로 고정 가능.
    """
    env_root = (os.environ.get("ETHICS_CORE_AI_ROOT") or "").strip()
    if env_root:
        p = Path(env_root).expanduser().resolve()
        if (p / "auto_ppt.cjs").is_file():
            return p

    if not getattr(sys, "frozen", False):
        base = Path(__file__).resolve().parent.parent
        return base if (base / "auto_ppt.cjs").is_file() else base

    exe_dir = Path(sys.executable).resolve().parent
    if (exe_dir / "auto_ppt.cjs").is_file():
        return exe_dir
    # 자주 쓰는 폴더명
    for sub in ("ethics-coreai-웹-앱", "ethics-coreai-web"):
        cand = exe_dir / sub
        if (cand / "auto_ppt.cjs").is_file():
            return cand.resolve()
    # 바탕 화면 등: exe 옆 **아무 하위 폴더**나 살펴서 auto_ppt.cjs 포함 여부
    try:
        for child in sorted(exe_dir.iterdir(), key=lambda x: str(x).lower()):
            if child.is_dir() and (child / "auto_ppt.cjs").is_file():
                return child.resolve()
    except OSError:
        pass
    for p in [exe_dir, *exe_dir.parents][:16]:
        if (p / "auto_ppt.cjs").is_file():
            return p.resolve()
    return exe_dir


def read_stored_gemini_key(repo: Path) -> str:
    """프로젝트 루트 .env.local → .env 순으로 GEMINI / GOOGLE 키 조회."""
    for name in (".env.local", ".env"):
        p = repo / name
        if not p.is_file():
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except OSError:
            continue
        for line in text.splitlines():
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            if s.startswith("GEMINI_API_KEY=") or s.startswith("GOOGLE_API_KEY="):
                _, _, val = s.partition("=")
                val = val.strip().strip('"').strip("'")
                if val:
                    return val
    return ""


def merge_gemini_key(env_file: Path, api_key: str) -> None:
    key = api_key.strip()
    lines: list[str] = []
    if env_file.is_file():
        lines = env_file.read_text(encoding="utf-8").splitlines()
    out: list[str] = []
    found = False
    for line in lines:
        s = line.strip()
        if s.startswith("GEMINI_API_KEY=") or s.startswith("GOOGLE_API_KEY="):
            out.append(f"GEMINI_API_KEY={key}")
            found = True
        else:
            out.append(line)
    if not found:
        if out and out[-1].strip():
            out.append("")
        out.append(f"GEMINI_API_KEY={key}")
    env_file.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")


class PptGuiApp:
    def __init__(self) -> None:
        self.repo = find_repo_root()
        self.auto_ppt = self.repo / "auto_ppt.cjs"
        self.env_local = self.repo / ".env.local"
        self.node = shutil.which("node")

        self.root = tk.Tk()
        self.root.title("Ethics-Core AI — PPT 자동 생성 · GUI-2026-05-03")
        self.root.minsize(720, 640)
        self.root.geometry("820x700")

        self.proc: subprocess.Popen | None = None
        self.q: queue.Queue[tuple[str, object]] = queue.Queue()
        self.root.after(200, self._poll_queue)

        self._build_ui()

    def _build_ui(self) -> None:
        pad = {"padx": 10, "pady": 6}
        f = ttk.Frame(self.root, padding=10)
        f.pack(fill=tk.BOTH, expand=True)

        ttk.Label(f, text="슬라이드 목표 장수", font=("", 10, "bold")).grid(row=0, column=0, sticky=tk.W, **pad)
        self.var_slides = tk.StringVar(value="18")
        ttk.Spinbox(f, from_=6, to=60, textvariable=self.var_slides, width=8).grid(row=0, column=1, sticky=tk.W, **pad)

        ttk.Label(f, text="기관(교육·주관)", font=("", 10, "bold")).grid(row=1, column=0, sticky=tk.W, **pad)
        self.entry_org = ttk.Entry(f, width=70)
        self.entry_org.grid(row=1, column=1, columnspan=2, sticky=tk.EW, **pad)
        self.entry_org.insert(0, "예: ○○시청 공직자윤리과")

        ttk.Label(f, text="주제(제목)", font=("", 10, "bold")).grid(row=2, column=0, sticky=tk.NW, **pad)
        self.txt_topic = scrolledtext.ScrolledText(f, height=5, width=70, wrap=tk.WORD)
        self.txt_topic.grid(row=2, column=1, columnspan=2, sticky=tk.NSEW, **pad)

        ttk.Label(f, text="내용 키워드", font=("", 10, "bold")).grid(row=3, column=0, sticky=tk.NW, **pad)
        kwf = ttk.Frame(f)
        kwf.grid(row=3, column=1, columnspan=2, sticky=tk.NSEW, **pad)
        self.lb_kw = tk.Listbox(kwf, height=10, selectmode=tk.EXTENDED, exportselection=False)
        sb = ttk.Scrollbar(kwf, orient=tk.VERTICAL, command=self.lb_kw.yview)
        self.lb_kw.configure(yscrollcommand=sb.set)
        self.lb_kw.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        sb.pack(side=tk.RIGHT, fill=tk.Y)
        for k in KEYWORD_PRESETS:
            self.lb_kw.insert(tk.END, k)
        bkw = ttk.Frame(kwf)
        bkw.pack(fill=tk.X, pady=6)
        ttk.Button(bkw, text="선택 키워드 → 주제에 넣기", command=self._insert_keywords).pack(side=tk.LEFT, padx=4)

        ttk.Separator(f, orient=tk.HORIZONTAL).grid(row=4, column=0, columnspan=3, sticky=tk.EW, pady=10)

        ttk.Label(f, text="Gemini API 키", font=("", 10, "bold")).grid(row=5, column=0, sticky=tk.NW, **pad)
        key_col = ttk.Frame(f)
        key_col.grid(row=5, column=1, sticky=tk.NSEW, **pad)
        self.entry_key = ttk.Entry(key_col, width=55, show="*")
        self.entry_key.pack(fill=tk.X)
        self.lbl_key_help = ttk.Label(
            key_col,
            text="",
            font=("", 8),
            foreground="#666",
            wraplength=520,
            justify=tk.LEFT,
        )
        self.lbl_key_help.pack(anchor=tk.W, pady=(4, 0))
        ttk.Button(f, text="설정 저장", command=self._save_key).grid(row=5, column=2, sticky=tk.NE, **pad)

        sk = read_stored_gemini_key(self.repo)
        if sk:
            self.lbl_key_help.configure(
                text="✓ 프로젝트 .env.local(또는 .env)에 키가 이미 있습니다. "
                "여기에는 다시 넣지 않아도 됩니다. 「PPT 생성하기」만 누르세요. "
                "키를 바꿀 때만 아래에 입력 후 「설정 저장」."
            )
        else:
            self.lbl_key_help.configure(
                text="저장된 키가 없습니다. 아래에 입력 후 「설정 저장」, 또는 VS Code로 .env.local 을 만드세요."
            )

        ttk.Label(f, text="진행 상황", font=("", 10, "bold")).grid(row=6, column=0, sticky=tk.W, **pad)
        self.lbl_status = ttk.Label(f, text="대기 — 아래에서 PPT 생성을 누르세요.", foreground="#333")
        self.lbl_status.grid(row=6, column=1, columnspan=2, sticky=tk.W, **pad)
        self.prog = ttk.Progressbar(f, maximum=9, mode="determinate", length=400)
        self.prog.grid(row=7, column=1, columnspan=2, sticky=tk.EW, **pad)
        ttk.Label(
            f,
            text="단계: 01준비 → 02AI요청 → 03JSON → 04타이틀·목차 → 05본문 → 06데이터·법령·사례 → 07정리 → 08저장 → 09완료",
            font=("", 8),
            foreground="#666",
        ).grid(row=8, column=1, columnspan=2, sticky=tk.W, **pad)

        bf = ttk.Frame(f)
        bf.grid(row=9, column=0, columnspan=3, pady=16)
        ttk.Button(bf, text="PPT 생성하기", command=self._start).pack(side=tk.LEFT, padx=6, ipadx=12, ipady=6)
        ttk.Button(bf, text="중지", command=self._stop).pack(side=tk.LEFT, padx=6, ipadx=12, ipady=6)

        self.var_log = tk.BooleanVar(value=False)
        ttk.Checkbutton(f, text="상세 로그(콘솔 출력) 표시", variable=self.var_log).grid(row=10, column=1, sticky=tk.W, **pad)

        self.txt_log = scrolledtext.ScrolledText(f, height=8, width=90, state=tk.DISABLED, wrap=tk.WORD)
        self.txt_log.grid(row=11, column=0, columnspan=3, sticky=tk.NSEW, **pad)

        f.columnconfigure(1, weight=1)
        f.rowconfigure(2, weight=1)
        f.rowconfigure(3, weight=1)
        f.rowconfigure(11, weight=1)

        foot = ttk.Label(
            f,
            text=f"프로젝트: {self.repo}  |  결과: outputs 폴더  |  Node: {self.node or '(없음)'}",
            font=("", 8),
            foreground="#888",
        )
        foot.grid(row=12, column=0, columnspan=3, sticky=tk.W, pady=(8, 0))

    def _append_log(self, line: str) -> None:
        self.txt_log.configure(state=tk.NORMAL)
        self.txt_log.insert(tk.END, line + "\n")
        self.txt_log.see(tk.END)
        self.txt_log.configure(state=tk.DISABLED)

    def _insert_keywords(self) -> None:
        sel = [self.lb_kw.get(i) for i in self.lb_kw.curselection()]
        if not sel:
            messagebox.showinfo("알림", "목록에서 키워드를 하나 이상 선택하세요.")
            return
        block = "\n[포함 키워드] " + ", ".join(sel)
        self.txt_topic.insert(tk.END, block)

    def _save_key(self) -> None:
        k = self.entry_key.get().strip()
        if not k:
            if read_stored_gemini_key(self.repo):
                messagebox.showinfo("알림", "입력란이 비어 있어도, 이미 .env.local/.env 에 키가 있으면 그대로 사용됩니다.")
            else:
                messagebox.showwarning("알림", "API 키를 입력한 뒤 저장하세요.")
            return
        try:
            merge_gemini_key(self.env_local, k)
            messagebox.showinfo("저장됨", f".env.local 에 저장했습니다.\n{self.env_local}")
        except OSError as e:
            messagebox.showerror("오류", str(e))

    def _poll_queue(self) -> None:
        try:
            while True:
                kind, payload = self.q.get_nowait()
                if kind == "status":
                    self.lbl_status.configure(text=str(payload))
                elif kind == "prog":
                    self.prog["value"] = int(payload)
                elif kind == "log":
                    self._append_log(str(payload))
                elif kind == "done":
                    messagebox.showinfo("완료", str(payload))
                elif kind == "err":
                    messagebox.showerror("오류", str(payload))
        except queue.Empty:
            pass
        self.root.after(200, self._poll_queue)

    def _stop(self) -> None:
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.proc.kill()
            self.q.put(("status", "중지됨"))
            self.q.put(("prog", 0))

    def _start(self) -> None:
        if self.proc and self.proc.poll() is None:
            messagebox.showwarning("알림", "이미 생성 중입니다. 중지 후 다시 시도하세요.")
            return
        if not self.node:
            messagebox.showerror("오류", "PATH에서 node.exe 를 찾을 수 없습니다. Node.js를 설치하세요.")
            return
        if not self.auto_ppt.is_file():
            messagebox.showerror(
                "auto_ppt.cjs 를 찾을 수 없음",
                "실행 파일이 있는 폴더에 프로젝트 폴더가 있어야 합니다.\n\n"
                "예) 바탕 화면에\n"
                "  • Ethics-Core-PPT-GUI.exe\n"
                "  • ethics-coreai-웹-앱  (폴더, 안에 auto_ppt.cjs)\n"
                "이렇게 나란히 두세요.\n\n"
                f"(지금 찾은 경로: {self.repo})\n\n"
                "다른 위치면 사용자 환경 변수에\n"
                "ETHICS_CORE_AI_ROOT = 프로젝트 루트 경로\n"
                "를 지정하세요.",
            )
            return

        topic = self.txt_topic.get("1.0", tk.END).strip()
        if not topic:
            messagebox.showwarning("알림", "주제를 입력하세요.")
            return

        slides = self.var_slides.get().strip() or "18"
        org = self.entry_org.get().strip()
        kws = [KEYWORD_PRESETS[i] for i in self.lb_kw.curselection()]

        cfg = {
            "topic": topic,
            "organization": org,
            "slideCount": int(slides) if slides.isdigit() else slides,
            "keywords": kws,
        }

        fd, path = tempfile.mkstemp(suffix=".json", prefix="ppt-gui-")
        os.close(fd)
        tmp = Path(path)
        try:
            tmp.write_text(json.dumps(cfg, ensure_ascii=False), encoding="utf-8")
        except OSError as e:
            messagebox.showerror("오류", str(e))
            return

        self.prog["value"] = 0
        self.lbl_status.configure(text="시작…")
        self.txt_log.configure(state=tk.NORMAL)
        self.txt_log.delete("1.0", tk.END)
        self.txt_log.configure(state=tk.DISABLED)

        env = os.environ.copy()
        env["PPT_GUI_PROGRESS"] = "1"

        creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0) if sys.platform == "win32" else 0

        def worker() -> None:
            try:
                cmd = [self.node, str(self.auto_ppt), "--config-json", str(tmp)]
                self.proc = subprocess.Popen(
                    cmd,
                    cwd=str(self.repo),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    env=env,
                    creationflags=creationflags,
                )
                assert self.proc.stdout
                for line in self.proc.stdout:
                    line = line.rstrip("\r\n")
                    if line.startswith("PPT_PROGRESS\t"):
                        parts = line.split("\t", 2)
                        if len(parts) >= 3:
                            try:
                                step = int(parts[1])
                                self.q.put(("prog", step))
                                self.q.put(("status", parts[2]))
                            except ValueError:
                                pass
                    elif line.startswith("PPT_ERROR\t"):
                        self.q.put(("err", line.split("\t", 1)[-1]))
                        return
                    elif self.var_log.get():
                        self.q.put(("log", line))
                code = self.proc.wait()
                if code != 0:
                    self.q.put(("err", f"종료 코드 {code}"))
                else:
                    self.q.put(("status", "완료"))
                    self.q.put(("prog", 9))
                    self.q.put(("done", "outputs 폴더에 .pptx 가 생성되었습니다."))
            except Exception as e:  # noqa: BLE001
                self.q.put(("err", str(e)))
            finally:
                try:
                    tmp.unlink(missing_ok=True)
                except OSError:
                    pass
                self.proc = None

        threading.Thread(target=worker, daemon=True).start()

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    PptGuiApp().run()


if __name__ == "__main__":
    main()
