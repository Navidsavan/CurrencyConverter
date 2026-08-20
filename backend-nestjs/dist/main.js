"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const app_setup_1 = require("./app.setup");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: allowedOrigins?.length ? allowedOrigins : true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    (0, app_setup_1.configureApp)(app);
    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`NestJS Currency Converter API is running on: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map