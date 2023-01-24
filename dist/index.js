"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const uuid_1 = require("uuid");
const main = async () => {
    let opts = {
        debug: process.env.BAM_DEBUG === "true",
        ssl: process.env.BAM_SSL === "true",
        sslMode: process.env.BAM_SSL_MODE || "",
        email: process.env.BAM_EMAIL || "",
        logToken: process.env.BAM_LOG_TOKEN || "",
        socketToken: process.env.BAM_SOCKET_TOKEN || "",
        staticFilesDir: process.env.BAM_STATIC_FILES_DIR || "",
        domain: process.env.BAM_DOMAIN || "",
        sessionUuid: (0, uuid_1.v4)(),
    };
    const app = await (0, app_1.createApp)(opts);
    if (opts.ssl) {
        app.listen(443);
    }
    else {
        app.listen(3000);
    }
    console.log("Gateway running on http://localhost:3000/");
};
main();
