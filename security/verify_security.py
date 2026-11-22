#!/usr/bin/env python3
"""Validate CSP hashes and basic security properties before deployment."""
from pathlib import Path
import re, hashlib, base64, html, sys
root=Path(__file__).resolve().parent.parent
csp=(root/'security/CSP_POLICY.txt').read_text().strip()
assert "'unsafe-eval'" not in csp and "script-src 'self'" in csp
header=(root/'_headers').read_text()
assert 'Content-Security-Policy: '+csp+"; frame-ancestors 'none'" in header
all_hashes=[]
for file in ['index.html','404.html','about.html','projects.html']:
    source=(root/file).read_text()
    found=re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">',source)
    assert found and html.unescape(found.group(1)) == csp, f'CSP mismatch: {file}'
    for code in re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', source, re.S):
        if code.strip():
            token="'sha256-"+base64.b64encode(hashlib.sha256(code.encode()).digest()).decode()+"'"
            assert token in csp, f'Inline script hash mismatch: {file}'
            all_hashes.append(token)
assert len(all_hashes)==4, 'Unexpected number of inline scripts'
assert 'counter.innerHTML' not in (root/'assets/portfolio.js').read_text()
assert 'turnstileSiteKey' in (root/'assets/config.js').read_text()
assert '@supabase/supabase-js@2.119.2' in (root/'assets/supabase.js').read_text()
print('PASS: CSP matches across 4 pages, inline hashes verified, DOM sink removed, configs present.')
