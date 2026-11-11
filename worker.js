// Cloudflare Worker: 代理豆包/DeepSeek/OpenAI 兼容 API 请求，解决浏览器跨域问题
// 部署：在 Cloudflare Dashboard 新建 Worker，粘贴此代码，保存即可免费启用
// 或者：npm i -g wrangler && wrangler login && wrangler deploy

export default {
  async fetch(request) {
    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };

    // OPTIONS 预检直接放行
    if (request.method === 'OPTIONS') {
      return new Response('', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: '只支持 POST 请求' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // 从 URL query 或 body 里取目标 endpoint
      const url = new URL(request.url);
      let target = url.searchParams.get('target');
      if (!target) {
        // 默认转发到豆包
        target = 'https://ark.cn-beijing.volces.com/api/v3';
      }
      // 去掉 target 末尾的 /
      target = target.replace(/\/+$/, '');

      const bodyText = await request.text();
      let body;
      try { body = JSON.parse(bodyText); } catch {
        return new Response(JSON.stringify({ error: 'JSON 解析失败' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 去掉 provider 字段（豆包不认）
      delete body.provider;

      // 从 Authorization 头取 API Key
      const authHeader = request.headers.get('Authorization') || '';
      const fetchHeaders = {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      };

      // 拼接完整目标 URL
      const apiPath = url.pathname.replace(/^\/api/, ''); // 去掉 /api 前缀
      const fullTarget = target + (apiPath || '/chat/completions');

      const upstreamRes = await fetch(fullTarget, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify(body),
      });

      const upstreamText = await upstreamRes.text();
      return new Response(upstreamText, {
        status: upstreamRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err.message || err) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
