import {NodeSDK} from "@opentelemetry/sdk-node";
import {getNodeAutoInstrumentations} from "@opentelemetry/auto-instrumentations-node";
import {TraceExporter} from "@google-cloud/opentelemetry-cloud-trace-exporter";
import {Resource} from "@opentelemetry/resources";
import {ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION} from "@opentelemetry/semantic-conventions";
import {diag, DiagConsoleLogger, DiagLogLevel} from "@opentelemetry/api";
import {WinstonInstrumentation} from "@opentelemetry/instrumentation-winston";

// Configure OpenTelemetry logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "ai-order-service",
    [ATTR_SERVICE_VERSION]: "1.0.0",
    // [SEMRESATTRS_CLOUD_PROVIDER]: "gcp",
    // [SEMRESATTRS_CLOUD_PLATFORM]: "gcp_cloud_functions",
  }),
  traceExporter: new TraceExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Only enable necessary instrumentations
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
    }),
    new WinstonInstrumentation(),
  ],
});

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.error("Error terminating tracing", error))
    .finally(() => process.exit(0));
});

export default sdk;
