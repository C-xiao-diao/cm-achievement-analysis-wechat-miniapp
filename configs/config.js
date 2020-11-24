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
    host: "cj.cminor.cc",
    port: 55555,
    qiniuDomain : "qg2vjw9lg.hn-bkt.clouddn.com",
    tmplIds: ['GjjTkEb-aK9ZUCFCjBzbVRjLISNZLrysaWKlXEgMzvA'],
  },
  [Applets.prod]: {
    protocol: "https" || "wss",
    host: "cj.cminor.cc",
    // port: 443,
    qiniuDomain : "qg2vjw9lg.hn-bkt.clouddn.com",
    tmplIds: ['GjjTkEb-aK9ZUCFCjBzbVRjLISNZLrysaWKlXEgMzvA'],
  }
};

module.exports = config[env];