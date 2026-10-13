import sys
import re

with open('src/app/admin/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const [paramError, setParamError] = useState('');", "const [paramError, setParamError] = useState('');\n  const [showResetConfirm, setShowResetConfirm] = useState(false);")

with open('src/app/admin/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
