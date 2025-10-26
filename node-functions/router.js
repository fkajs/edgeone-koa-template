import Router from '@koa/router';
import os from 'node:os';

const router = new Router({
  prefix: '/api',
});

// Define routes
router.get('/user', async (ctx) => {
  ctx.body = { message: 'Hello from Koa on Node Functions!' };
});

router.get('/os/info', async (ctx) => {
  ctx.body = {
    cups: os.cpus(),
    arch: os.arch(),
    mem: os.totalmem()/1024/1024/1024 + 'GB',
  };
});

// Gemini API 代理路由
router.all('/gemini/*', async (ctx) => {
  const targetUrl = 'https://generativelanguage.googleapis.com' + 
                   ctx.path.replace('/api/gemini', '') + 
                   ctx.search;
  
  try {
    // 获取请求头，过滤掉可能导致问题的头部
    const headers = { ...ctx.headers };
    delete headers.host;
    delete headers['content-length'];
    delete headers.connection;
    
    // 添加 API 密钥（如果存在）
    const apiKey = process.env.GEMINI_API_KEY || headers['x-api-key'];
    let finalUrl = targetUrl;
    
    if (apiKey && !targetUrl.includes('key=')) {
      const separator = targetUrl.includes('?') ? '&' : '?';
      finalUrl = targetUrl + separator + 'key=' + apiKey;
    }
    
    const response = await fetch(finalUrl, {
      method: ctx.method,
      headers: {
        ...headers,
        'Content-Type': headers['content-type'] || 'application/json',
      },
      body: (ctx.method !== 'GET' && ctx.method !== 'HEAD') ? ctx.request.body : undefined,
    });
    
    // 设置响应头
    ctx.status = response.status;
    ctx.set('Content-Type', response.headers.get('content-type') || 'application/json');
    
    // 返回响应数据
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      ctx.body = await response.json();
    } else {
      ctx.body = await response.text();
    }
  } catch (error) {
    console.error('Gemini API proxy error:', error);
    ctx.status = 500;
    ctx.body = { 
      error: 'Proxy error', 
      message: error.message,
      details: 'Failed to forward request to Gemini API'
    };
  }
});

export { router };
