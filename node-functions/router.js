import Router from '@koa/router';
import os, { arch } from 'node:os';

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

export { router };
