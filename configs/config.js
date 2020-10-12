const Applets = {
  dev: "dev",
  test: "test",
  prod: "prod",
};

const env = "prod";

const config = {
  version: "1.0.0",
  [Applets.dev]: {
    protocol: "http" || "ws",
    hostProduction: "xxxx",
    host: "192.168.1.5",
    port: 3000,
    qiniuDomain : "qg2vjw9lg.hn-bkt.clouddn.com"
  },
  [Applets.prod]: {
    protocol: "https" || "wss",
    host: "https://cminor.dookbook.info",
    // port: 443,
    qiniuDomain : "qg2vjw9lg.hn-bkt.clouddn.com"
  }
};

module.exports = config[env];