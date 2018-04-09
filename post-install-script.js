var fs = require('fs');

if (!fs.existsSync('./config.js')) {
    var copyFile = require('quickly-copy-file');
    copyFile('./config-example.js', 'config.js')
        .then(() => console.log('config-example.js has been successfully copied to config.js'))
        .catch(error => console.error('An error occured. You may need to manually copy and rename config-example.js to config.js'));
}
