import {Router} from 'express';

const router = Router();

router.get('/', async (_req, res, _next) => {
    const healthcheck = {
        uptime: process.uptime(),           // how long the server has been up and running since it started
        responseTime: process.hrtime(),     // how long it takes the server to respond to requests
        message: 'OK',                      // message that indicates that everything is good
        timestamp: Date.now()               // timestamp
    };
    try {
        res.send(healthcheck);
    } catch (error) {
        healthcheck.message = error;
        res.status(503).send();
    }
});

export default router;