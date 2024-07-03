import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.get('/generate-signed-url', async (req, res) => {
    // todo...
  });
};

export default plugin;
