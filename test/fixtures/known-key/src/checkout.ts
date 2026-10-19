import { createClient } from "@configdirector/server-sdk";

const client = createClient("YOUR-SERVER-SDK-KEY");

export const scanCodeCheck = () => client.getValue("scan-code-check", false);
