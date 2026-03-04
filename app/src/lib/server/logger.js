import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

const dev = process.env.ENV === 'dev';

function otelIds() {
	const span = trace.getSpan(context.active());
	if (!span) return {};

	const { traceId, spanId } = span.spanContext();
	return {
		trace_id: traceId,
		span_id: spanId
	};
}

export const logger = pino({
	name: 'svelte',
	base: undefined, // don’t add pid/hostname unless you want them
	level: process.env.LOG_LEVEL ?? (dev ? 'debug' : 'info'),
	transport: dev
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:standard',
					singleLine: false,
					ignore: 'pid,hostname'
				}
			}
		: undefined,
	mixin() {
		return otelIds();
	}
});
