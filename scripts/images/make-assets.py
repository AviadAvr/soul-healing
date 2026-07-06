"""
Regenerate every generated brand asset in one go.
Run:  python scripts/make-assets.py

Each asset also has its own script (make-*.py) if you only need to rebuild one.
"""
import runpy
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Order is cosmetic; the scripts are independent.
SCRIPTS = [
    "make-favicon.py",
    "make-logo.py",
    "make-hero-bg.py",
    "make-about-2.py",
    "make-og-image.py",
]

for name in SCRIPTS:
    print(f"\n▶ {name}")
    runpy.run_path(str(HERE / name), run_name="__main__")

print("\n✅ All assets regenerated.")

