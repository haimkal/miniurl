import fastifyConstructor from 'fastify'
import { config } from './services/config/index.js'
import { routes } from './routes/index.js'
import { Storage } from './services/storage/index.js'

declare module 'fastify' {
	interface FastifyInstance {
		config: typeof config
		storage: Storage
	}
}

// Fastify
const fastify = fastifyConstructor({
	ignoreTrailingSlash: true,
	logger: true,
})

// Config
fastify.decorate('config', config)

// Storage
const storage = new Storage({
	appName: config.appName,
	driverName: config.storage.driverName,
	driverConfig: config.storage.driverConfig,
})

await storage.initialize()
fastify.decorate('storage', storage)

// Run
await fastify.register(routes)
try {
	await fastify.listen(config.port, '0.0.0.0')
} catch (err) {
	fastify.log.error(err)
	process.exit(1)
}
