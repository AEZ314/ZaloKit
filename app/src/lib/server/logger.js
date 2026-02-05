import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

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
	mixin() {
		return otelIds();
	}
});
