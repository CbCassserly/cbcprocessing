var fs = require('fs');

if (!fs.existsSync('./config.js')) {
    var copyFile = require('quickly-copy-file');
    copyFile('./config-example.js', 'config.js')
        .then(function () {
            console.log('config-example.js has been successfully copied to config.js');
        })
        .catch(function (error) {
            console.error('An error occured. You may need to manually copy and rename config-example.js to config.js');
        });
}
