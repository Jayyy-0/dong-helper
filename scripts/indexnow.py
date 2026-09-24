#!/usr/bin/env python3
"""Tell IndexNow search engines (Bing, Yahoo, DuckDuckGo, Yandex, Seznam...) that pages changed.

No account needed: ownership is proven by the key file published at KEY_LOCATION.
Google does not use IndexNow. Reads the page list from sitemap.xml.

    python scripts/indexnow.py
"""
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOST = "jayyy-0.github.io"
KEY = "5ea731a6a3bff0c2cb8df97676544eb4"
KEY_LOCATION = f"https://{HOST}/dong-helper/{KEY}.txt"


def main():
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    urls = re.findall(r"<loc>([^<]+)</loc>", sitemap)
    body = json.dumps({"host": HOST, "key": KEY, "keyLocation": KEY_LOCATION, "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            print("IndexNow: HTTP %s for %d URLs" % (r.status, len(urls)))
    except urllib.error.HTTPError as e:
        # Never fail the daily job over a notification.
        print("IndexNow: HTTP %s %s" % (e.code, e.read()[:200]))
    except Exception as e:
        print("IndexNow: failed: %s" % e)
    return 0


if __name__ == "__main__":
    sys.exit(main())
