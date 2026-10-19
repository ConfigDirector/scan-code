import { createClient } from "@configdirector/server-sdk";

const client = createClient("YOUR-SERVER-SDK-KEY");

export const missingConfig = () => client.getValue("no-config-has-this-key", false);
