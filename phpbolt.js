var args = new Object();
process.argv.slice(2).forEach(arg => {
    arg = arg.split("=");
    args[arg[0]] = arg[1];
});

async function phpBolt(path) {
    return new Promise((resolv, reject) => {
        consol.push(`${colours.fg.green}PHPBOLT${colours.reset} -> Carregando...`);
        let phpBOLT = spawn(`${__dirname}/libs/php/php.exe`, [`${__dirname}/libs/phpBOLT.php`, path.split("\\").join("/")]);
        phpBOLT.stdout.on("data", data => {
            console.log(`phpBOLT: ${data}`);
        });

        phpBOLT.on('error', (error) => {
            //sysLogErr({ acc: 'php-start', data: error });
            console.log(`error: ${error.message}`);
            consol.push(error.message);
        });

        phpBOLT.on("close", async code => {
            consol[consol.length - 2] = `${colours.fg.green}PHPBOLT${colours.reset} -> OK`;
            resolv(true);
        });
    })
}
phpBolt(args['dir']);