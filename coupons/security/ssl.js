
var fs = require('fs');

module.exports={
    key: fs.readFileSync('../../mec_coupons/security/keys/server_private.key'),
    cert: fs.readFileSync('../../mec_coupons/security/keys/coupons_server.crt')
}