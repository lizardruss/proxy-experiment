import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as passport from 'koa-passport';
import * as http from 'http';
import * as httpProxy from 'http-proxy';
import * as session from 'koa-session';

process.on('uncaughtException', console.error.bind(console));
process.on('unhandledRejection', console.error.bind(console));

const proxy = httpProxy.createProxyServer({
  agent: new http.Agent({ keepAlive: true })
});

const app = new Koa();
app.keys = ['doop-dee-doop']
app.use(session(app))
app.use(bodyParser());
app.use(passport.initialize());
app.use(passport.session());
app.use((ctx) => {
  console.log('WEB');

  ctx.session.russWasHere = true;
  
  ctx.respond = false; // Required to prevent koa from sending out headers
  
  proxy.web(ctx.req, ctx.res, {
    target: 'http://tutor.preschool.io',
  });
});

const server = app.listen(8000);

server.on('upgrade', (req, socket, head) => {
  console.log('WEBSOCKET');
  
  proxy.ws(req, socket, head, {
    target: 'http://tutor.preschool.io'
  });
});