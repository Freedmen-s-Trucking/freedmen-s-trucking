import admin from "firebase-admin";
import {RemoteConfigTemplate} from "firebase-admin/remote-config";
import minimist from "minimist";
import prodRC from "./config-templates/prod";
import devRC from "./config-templates/dev";

const argv = minimist(process.argv.slice(2), {
  string: "environment",
  boolean: ["dry_run"],
});
console.log(`Deploying remote config for environment: ${argv.environment}`);
console.log(`Dry-run: ${argv.dry_run}`);

admin.initializeApp();

// Load the config for the corresponding environment.
const targetConfig = (await argv.environment) === "dev" ? devRC : prodRC;

// Start with the published template.
// This allows us to let Firebase manage etags and versions.
// Then update, validate and publish.
admin
  .remoteConfig()
  .getTemplate()
  .then(validate)
  .catch((err) => {
    console.error("Unable to get current template");
    console.error(err);
    process.exit(1);
  });

/**
 * Validates the template.
 * @param {RemoteConfigTemplate} template The template to validate.
 */
function validate(template: RemoteConfigTemplate) {
  console.log("ETag (before) from server: " + template.etag);
  console.log(
    "Version (before) from server: " + JSON.stringify(template.version),
  );

  // Update the template to match the environment configuration.
  template.conditions = targetConfig.conditions;
  template.parameters = targetConfig.parameters;
  template.parameterGroups = targetConfig.parameterGroups;

  // Safeguard against submitting a template that would break
  // remote config.
  admin
    .remoteConfig()
    .validateTemplate(template)
    .then(publish)
    .catch((err) => {
      console.error("Template is invalid and cannot be published");
      console.error(err);
      process.exit(1);
    });
}

/**
 * Publishes the template to the remote config.
 * @param {RemoteConfigTemplate} template The template to publish.
 */
function publish(template: RemoteConfigTemplate) {
  // The template is valid and safe to use.
  console.log("Template was valid and safe to use");

  if (argv.dry_run) {
    console.log("Dry-run. Skip publishing.");
    return;
  }

  // Let's publish it.
  admin
    .remoteConfig()
    .publishTemplate(template)
    .then((updatedTemplate) => {
      console.log("Template has been published");
      console.log("ETag (after) from server: " + updatedTemplate.etag);
      console.log(
        "Version (after) from server: " +
          JSON.stringify(updatedTemplate.version),
      );
    })
    .catch((err) => {
      console.error("Unable to publish template.");
      console.error(err);
      process.exit(1);
    });
}
