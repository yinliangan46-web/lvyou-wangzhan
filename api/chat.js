/* 站点 AI 代理：在 Vercel 环境变量里配置任一 Key 即可启用
 *   DEEPSEEK_API_KEY   -> DeepSeek
 *   ARK_API_KEY        -> 豆包（火山方舟）
 * 可选：AI_PROVIDER=deepseek|doubao、DEEPSEEK_MODEL、ARK_MODEL
 * 前端默认请求 /api/chat，Key 不会暴露给浏览器。
 */
const PROVIDERS = {
    deepseek: {
        url: 'https://api.deepseek.com/chat/completions',
        keyEnv: 'DEEPSEEK_API_KEY',
        modelEnv: 'DEEPSEEK_MODEL',
        defaultModel: 'deepseek-chat'
    },
    doubao: {
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        keyEnv: 'ARK_API_KEY',
        modelEnv: 'ARK_MODEL',
        defaultModel: 'doubao-seed-1-6-250615'
    }
};

function pickProvider() {
    const forced = (process.env.AI_PROVIDER || '').toLowerCase();
    if (PROVIDERS[forced] && process.env[PROVIDERS[forced].keyEnv]) return forced;
    if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
    if (process.env.ARK_API_KEY) return 'doubao';
    return null;
}

/* 简易内存限流：每个实例每 IP 每分钟最多 20 次 */
const HITS = new Map();
function rateLimited(ip) {
    const now = Date.now();
    const rec = HITS.get(ip) || { t: now, n: 0 };
    if (now - rec.t > 60000) { rec.t = now; rec.n = 0; }
    rec.n += 1;
    HITS.set(ip, rec);
    if (HITS.size > 5000) HITS.clear();
    return rec.n > 20;
}

module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const provider = pickProvider();

    if (req.method === 'GET') {
        return res.status(200).json({ ok: true, configured: !!provider, provider });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    if (!provider) {
        return res.status(503).json({
            error: '站点 AI 未配置：请在 Vercel 环境变量设置 DEEPSEEK_API_KEY 或 ARK_API_KEY'
        });
    }

    const fwd = (req.headers && req.headers['x-forwarded-for']) || '';
    const ip = String(fwd).split(',')[0].trim() || 'unknown';
    if (rateLimited(ip)) {
        return res.status(429).json({ error: '请求太频繁，请稍后再试' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    const messages = body && Array.isArray(body.messages) ? body.messages : null;
    if (!messages || !messages.length) {
        return res.status(400).json({ error: '缺少 messages' });
    }

    /* 简单限流，避免被刷 */
    const totalChars = messages.reduce(function (n, m) { return n + String((m && m.content) || '').length; }, 0);
    if (totalChars > 24000) {
        return res.status(413).json({ error: '对话内容过长，请精简后再试' });
    }

    const cfg = PROVIDERS[provider];
    const key = process.env[cfg.keyEnv];
    const model = (body.model && body.model !== 'auto')
        ? body.model
        : (process.env[cfg.modelEnv] || cfg.defaultModel);

    const payload = {
        model: model,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.3,
        max_tokens: 1400,
        messages: messages.map(function (m) {
            return { role: m.role, content: String(m.content || '') };
        })
    };
    /* 让模型稳定输出 JSON，失败时自动去掉该参数重试一次 */
    payload.response_format = { type: 'json_object' };

    async function callUpstream(withFormat) {
        const p = Object.assign({}, payload);
        if (!withFormat) delete p.response_format;
        const r = await fetch(cfg.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify(p)
        });
        const text = await r.text();
        return { ok: r.ok, status: r.status, text: text };
    }

    try {
        let out = await callUpstream(true);
        if (!out.ok && (out.status === 400 || out.status === 422)) out = await callUpstream(false);
        if (!out.ok) {
            let msg = '上游模型返回 HTTP ' + out.status;
            try { msg = JSON.parse(out.text).error.message || msg; } catch (e) { }
            return res.status(502).json({ error: msg });
        }
        res.status(200).send(out.text);
    } catch (e) {
        return res.status(502).json({ error: '上游请求失败：' + (e && e.message ? e.message : 'unknown') });
    }
};
