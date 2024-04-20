#!/usr/bin/env node
let fs = require("fs");
let os = require('os');
var http = require('http');
const zl = require("zip-lib");
var consol = [];
const colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m",
        crimson: "\x1b[48m"
    }
};
let clock = setInterval(() => {
    process.stdout.write('\x1Bc')
    console.log(consol.join('\n'))
}, 1000)

var package = fs.readFileSync(`${process.cwd()}/package.json`, { encoding: "utf8" });
consol.push(`Guara NW`);
package = JSON.parse(package);
if (!fs.existsSync(`${os.homedir()}/nw`)) {
    fs.mkdirSync(`${os.homedir()}/nw`)
}
consol.push(`${colours.fg.green}OK${colours.reset} -> Folder -------- ${os.homedir()}\\gnw`);
main().then(res => {
    process.stdout.write('\x1Bc')
    console.log(consol.join('\n'))
    clearInterval(clock);
});

async function main() {
    return new Promise(async (resolv, reject) => {
        for (let cont = 0; cont < package.nw.target.length; cont++) {
            if (!fs.existsSync(`${os.homedir()}/gnw/${package.nw.version}_${package.nw.target[cont]}.zip`)) {
                consol.push(`${package.nw.version}_${package.nw.target[cont]} -------- 0%`);
                await download(`http://dl.nwjs.io/v${package.nw.version}/nwjs-v${package.nw.version}-${package.nw.target[cont]}.zip`, `${os.homedir()}/gnw/${package.nw.version}_${package.nw.target[cont]}.zip`);
                consol[consol.length - 1] = `${colours.fg.green}OK${colours.reset} -> ${package.nw.version}_${package.nw.target[cont]} -------- 100%`;
            } else {
                consol.push(`${colours.fg.green}OK${colours.reset} -> ${package.nw.version}_${package.nw.target[cont]} -------- 100%`)
            }

            //Extrair arquivos
            zl.extract(`${os.homedir()}/gnw/${package.nw.version}_${package.nw.target[cont]}.zip`, package.nw.output);
            fs.renameSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}`,);
        }
        resolv(true);
    })
}

async function download(url, path) {
    return new Promise((resolv, reject) => {
        var file = fs.createWriteStream(path);
        var len = 0;
        http.get(url, (res) => {
            res.on('data', function (chunk) {
                file.write(chunk);
                len += chunk.length;

                // percentage downloaded is as follows
                var percent = (len / res.headers['content-length']) * 100;
                consol[consol.length - 1] = `${consol[consol.length - 1].split(' -------- ')[0]} -------- ${percent}%`;
            });
            res.on('end', function () {
                file.close();
                resolv(true)
            });
            file.on('close', function () {
                // the file is done downloading
                resolv(true)
            });
        });
    })
}
