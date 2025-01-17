#!/usr/bin/env node

let fs = require("fs");
let os = require('os');
var http = require('http');
const zl = require("zip-lib");
const rcedit = require('rcedit');
var { execSync, exec, spawn } = require('child_process');

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
if (!fs.existsSync(`${os.homedir()}/gnw`)) {
    fs.mkdirSync(`${os.homedir()}/gnw`)
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
                consol.push(`${colours.fg.green}OK${colours.reset} -> ${package.nw.version}_${package.nw.target[cont]} -------- 100%`);
            }

            //Exist folder?
            if (fs.existsSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}`)) {
                fs.rmSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}`, { recursive: true, force: true });
            }

            //Extrair arquivos
            await zl.extract(`${os.homedir()}/gnw/${package.nw.version}_${package.nw.target[cont]}.zip`, package.nw.output);
            //Windows? setar icone
            if ((package.nw.target[cont]).includes("win")) {
                await rcedit(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/nw.exe`, {
                    icon: `${process.cwd()}/${package.nw.icon}`
                })
            }

            if (package.nw.compress) {
                const zip = new zl.Zip();
                zip.addFile(`${process.cwd()}/package.json`);
                if (package.nw.ignore.length <= 0) {
                    zip.addFolder(`${process.cwd()}/package/`, "package");
                } else {
                    fs.readdirSync(`${process.cwd()}/package`).forEach(file => {
                        if (!package.nw.ignore.includes(file)) {
                            if (fs.lstatSync(`${process.cwd()}/package/${file}`).isDirectory()) {
                                zip.addFolder(`${process.cwd()}/package/${file}`, `package/${file}`);
                            } else {
                                zip.addFile(`${process.cwd()}/package/${file}`, `package/${file}`);
                            }
                        }

                    });
                }
                if (fs.existsSync(`${process.cwd()}/node_modules/`)) {
                    zip.addFolder(`${process.cwd()}/node_modules/`, "node_modules");
                }
                await zip.archive(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package.zip`);
                fs.renameSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package.zip`, `${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package.nw`);

                if (typeof package.nw.php != "undefined" && package.nw.php) {
                    await protectPHP(`${process.cwd()}/package`);
                }

                //Juntar NW + Package
                consol.push(`cat ${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/nw.exe ${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package.nw > ${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/app.exe`);
                consol.push(`nw+package -------- 0%`);
                execSync(`cat ${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/nw.exe ${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package.nw > ${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/app.exe`);
                fs.unlinkSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/nw.exe`);
                fs.unlinkSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package.nw`);
                fs.renameSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/app.exe`, `${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/nw.exe`);
            } else {
                fs.copyFileSync(`${process.cwd()}/package.json`, `${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package.json`);
                if (package.nw.ignore.length <= 0) {
                    fs.cpSync(`${process.cwd()}/package`, `${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package`, { recursive: true });
                } else {
                    fs.readdirSync(`${process.cwd()}/package/`).forEach(file => {
                        if (!package.nw.ignore.includes(file))
                            fs.cpSync(`${process.cwd()}/package/${file}`, `${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/package/${file}`, { recursive: true });
                    });
                }

                if (typeof package.nw.php != "undefined" && package.nw.php) {
                    await protectPHP(`${process.cwd()}/package`);
                }

                if (fs.existsSync(`${process.cwd()}/node_modules/`)) {
                    fs.cpSync(`${process.cwd()}/node_modules`, `${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/node_modules`, { recursive: true });
                }
            }

            if (typeof package.nw.ignore != "undefined") {
                package.nw.ignore.forEach(ign => {

                })
            }


            if (fs.existsSync(`${package.nw.output}/${package.name.split(" ").join("-")}-v${package.version}-${package.nw.target[cont]}`)) {
                fs.rmSync(`${package.nw.output}/${package.name.split(" ").join("-")}-v${package.version}-${package.nw.target[cont]}`, { recursive: true, force: true });
            }
            fs.renameSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/nw.exe`, `${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}/${package.name}.exe`);
            fs.renameSync(`${package.nw.output}/nwjs-v${package.nw.version}-${package.nw.target[cont]}`, `${package.nw.output}/${package.name.split(" ").join("-")}-v${package.version}-${package.nw.target[cont]}`);
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
                consol[consol.length - 1] = `${consol[consol.length - 1].split(' -------- ')[0]} -------- ${(percent * 1).toFixed(2)}%`;
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



// OFUSCAÇÃO DO PHP
async function protectPHP(path) {
    consol.push(`${colours.fg.green}PHP Protect${colours.reset} -> Iniciado...`);
    listFiles(path).then(async filesPHP => {
        consol.push(`${colours.fg.green}PHP Protect${colours.reset} -> Iniciado...`);
        for (let cont = 0; cont < filesPHP.length; cont++) {
            await phpOfusc(filesPHP[cont]);
            consol[consol.length - 1] = `${colours.fg.green}PHP Protect${colours.reset} -> ${consol.length}/${cont} `;
        }
        consol.push(`${colours.fg.green}PHP Protect${colours.reset} -> Finalizado.`);
    })
}
async function listFiles(path) {
    return new Promise(async (resolv, reject) => {
        let dirFiles = fs.readdirSync(path);
        let filesPHP = new Array();
        for (let cont = 0; cont < dirFiles.length; cont++) {
            if (fs.lstatSync(`${path}\\${dirFiles[cont]}`).isDirectory()) {
                filesPHP = filesPHP.concat(await listFiles(`${path}\\${dirFiles[cont]}`));
            } else {
                if (dirFiles[cont].includes(".php") && !`${path}\\${dirFiles[cont]}`.includes("vendor")) {
                    filesPHP.push(`${path}\\${dirFiles[cont]}`);
                }
            }
        }
        resolv(filesPHP);
    })
}
async function phpOfusc(pathFile) {
    return new Promise((resolv, reject) => {
        let PHPOfusc = spawn(`${__dirname}/libs/php/php.exe`, [`${__dirname}/libs/yakpro-po/yakpro-po.php`, pathFile.split("\\").join("/"), "-o", "./temp-yakpro-po.php"]);
        PHPOfusc.stdout.on("data", data => {
            consol.push(`PHPOfusc: ${data}`);
        });

        PHPOfusc.on('error', (error) => {
            //sysLogErr({ acc: 'php-start', data: error });
            consol.push(`error: ${error.message}`);
        });

        PHPOfusc.on("close", async code => {
            fs.unlinkSync(pathFile.split("\\").join("/"));
            fs.copyFileSync("./temp-yakpro-po.php", pathFile.split("\\").join("/"));
            fs.unlinkSync("./temp-yakpro-po.php");
            resolv(true);
        });
    })
}