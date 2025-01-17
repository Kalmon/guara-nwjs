#!/usr/bin/env node

var { spawn } = require('child_process');
var args = new Object();
process.argv.slice(2).forEach(arg => {
    arg = arg.split("=");
    args[arg[0]] = arg[1].split("'").join("").split('"').join("");
});
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
async function phpBolt(path) {
    return new Promise((resolv, reject) => {
        console.log(`${colours.fg.green}PHPBOLT${colours.reset} -> Carregando...`);
        let phpBOLT = spawn(`${__dirname}/libs/php/php.exe`, [`${__dirname}/libs/phpBolt.php`, path]);
        phpBOLT.stdout.on("data", data => {
            console.log(`phpBOLT: ${data}`);
        });

        phpBOLT.on('error', (error) => {
            //sysLogErr({ acc: 'php-start', data: error });
            console.log(`error: ${error.message}`);
            console.log(error.message);
        });

        phpBOLT.on("close", async code => {
            console.log(`${colours.fg.green}PHPBOLT${colours.reset} -> OK`);
            resolv(true);
        });
    })
}
phpBolt(args['dir']);