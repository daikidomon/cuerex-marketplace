#!/usr/bin/env python3
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DIST = ROOT / "dist"

subprocess.run(["python3", str(ROOT / "scripts" / "validate.py")], cwd=ROOT, check=True)

if DIST.exists():
    shutil.rmtree(DIST)
shutil.copytree(PUBLIC, DIST)

print(f"built {DIST.relative_to(ROOT)} from {PUBLIC.relative_to(ROOT)}")
