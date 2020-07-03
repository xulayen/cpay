let dotenv = require('dotenv');
dotenv.config('../env');

export default {
    weixin: {
        AppID: process.env.AppID,
        AppSecret: process.env.AppSecret,
        Key: process.env.Key,
        MchID: process.env.MchID,
        Redirect_uri: process.env.Redirect_uri,
        NotifyUrl: process.env.NotifyUrl,
        SSlCertPath: process.env.SSlCertPath,
        SSlCertPassword: process.env.SSlCertPassword,
        Ip: process.env.Ip,
        Facid: process.env.Facid
    },
    redis: {
        host: process.env.redis_host,
        port: process.env.redis_port,
        db: process.env.redis_db ? parseInt(process.env.redis_db) : 0
    },
    mySql: {
        host: process.env.mysql_host,
        user: process.env.mysql_user,
        pwd: process.env.mysql_pwd,
        db: process.env.mysql_db
    }

}