import "source-map-support/register.js";
import "dotenv/config";
import "./config.js";

// Export HTTP server
export {httpServer} from "./http-server/index";

// Export background triggers
export {driverUpdateTrigger} from "./triggers/driver";
export {orderUpdateTrigger} from "./triggers/order";

// Export schedulers
export {scheduleBackgroundCheck} from "./schedules/driver-background-check-scheduler";
export {scheduleDriverIdentityVerification} from "./schedules/driver-identity-verification-scheduler";
export {scheduleDriverInsuranceVerification} from "./schedules/driver-insurance-verification-scheduler";
