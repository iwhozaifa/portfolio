#!/bin/sh
# Makes Playwright's Chromium runnable for taste-skill's inspect.mjs on WSL/Ubuntu without sudo:
# downloads the NSS, NSPR and ALSA packages, unpacks them under .cache/chrome-libs and writes a
# wrapper that adds them to LD_LIBRARY_PATH. Point CHROME_PATH at the wrapper (npm scripts do).
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
dir="$root/.cache/chrome-libs"
chrome=$(ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1)
[ -n "$chrome" ] || { npx --yes playwright@1.64.0 install chromium; chrome=$(ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | sort -V | tail -1); }
mkdir -p "$dir/debs"
cd "$dir/debs"
for pkg in libnss3 libnspr4 libasound2t64; do
  ls ${pkg}_*.deb >/dev/null 2>&1 && continue
  if ! apt-get download "$pkg" >/dev/null 2>&1; then
    # The local apt index can be stale; take the newest build for this release from the pool.
    src=$(apt-cache show "$pkg" | awk '/^Source:/{print $2; exit}'); src=${src:-$pkg}
    ver=$(apt-cache policy "$pkg" | awk '/Candidate:/{print $2}' | sed 's/^[0-9]*://; s/ubuntu.*//')
    pool="http://archive.ubuntu.com/ubuntu/pool/main/$(printf %.1s "$src")/$src/"
    file=$(curl -s "$pool" | grep -o "${pkg}_${ver}[^\"]*_amd64.deb" | sort -uV | tail -1)
    curl -sfO "$pool$file"
  fi
done
for deb in *.deb; do dpkg-deb -x "$deb" "$dir/root"; done
cat > "$dir/chrome" <<WRAP
#!/bin/sh
export LD_LIBRARY_PATH="$dir/root/usr/lib/x86_64-linux-gnu\${LD_LIBRARY_PATH:+:\$LD_LIBRARY_PATH}"
exec "$chrome" "\$@"
WRAP
chmod +x "$dir/chrome"
"$dir/chrome" --headless=new --no-sandbox --version
