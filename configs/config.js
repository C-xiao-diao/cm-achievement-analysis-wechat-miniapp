const Applets = {
  dev: "dev",
  test: "test",
  prod: "prod",
};

const env = "dev";

const config = {
  version: "1.0.0",
  [Applets.dev]: {
    protocol: "http" || "ws",
    hostProduction: "xxxx",
    host: "cminor.dookbook.info",
    port: 55555,
    qiniuDomain : "qg2vjw9lg.hn-bkt.clouddn.com"
  },
  [Applets.prod]: {
    protocol: "https" || "wss",
    host: "cminor.dookbook.info",
    // port: 443,
    qiniuDomain : "qg2vjw9lg.hn-bkt.clouddn.com"
  }
};

module.exports = config[env];