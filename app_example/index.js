const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const express = require('express');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');

// Configurar o exportador OTLP para o Tempo
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

// Inicializar o SDK OpenTelemetry
const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  resource: new Resource({
    'service.name': 'app-trace-test',
  }),
});

sdk.start();

// App Node.js com Express
const app = express();

app.get('/', (req, res) => {
  res.send('Tracing example with Grafana Tempo!');
});

app.listen(3001, () => {
  console.log('Node.js app listening on port 3001');
});
