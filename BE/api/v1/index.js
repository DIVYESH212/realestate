const router = require('express').Router();



import webV1 from "./v1/web";
/*********** Combine all Routes ********************/

const app = Router();

app.use('/v1', webV1)

module.exports = router;
