const express = require('express')

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { Resource } = require('@opentelemetry/resources');

const appTempo = express()

// config o OLTP HTTP Exporter
const traceExporter = new OTLPTraceExporter({
	url: 'http://localhost:3100/api/traces',
})

// Habilitando logs de diagnóstico para debug (opcional)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Configurando o SDK do Node.js
const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [
    new HttpInstrumentation(), // Instrumentação HTTP
    new ExpressInstrumentation(), // Instrumentação Express (opcional, se você usar Express)
  ],
  resource: new Resource({
	SERVICE_NAME: 'app_tempo',
	SERVICE_VERSION: '1.0.0'
  }),
});

// Inicializando o SDK
try {
	sdk.start()
}catch(e) {
	console.log("erro sdk tempo", e)
}

// Lidando com o encerramento do processo
process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    console.log('OpenTelemetry SDK shut down gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK', error);
    process.exit(1);
  }
});



// iniciado a app
appTempo.get('/', async (req, res) => {
	res.end("Up renning APP TEMPO");
})
appTempo.get('/api/data', (req, res) => {
	setTimeout(() => {
		res.send("Hello, Grafana Tempo com OLTP/HTTP!")
	}, Math.random() * 2000);
})


appTempo.listen(3001, () => console.log("Servidor Node.js rodando em http://localhost:3001"))