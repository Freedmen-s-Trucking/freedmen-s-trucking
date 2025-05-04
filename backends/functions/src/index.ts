import "source-map-support/register.js";
import "dotenv/config";
import "./config.js";

// Export HTTP server
export {httpServer} from "./http-server/index";

// Export background triggers
export {driverUpdateTrigger} from "./triggers/driver";
export {orderUpdateTrigger} from "./triggers/order";

// Export schedulers
export {scheduleDriverIdentityVerification, scheduleBackgroundCheck} from "./schedules/auto-background-check";
