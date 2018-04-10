(function(){
    "use strict";

    console.log("Bot is starting");

    // Load required modules/files
    var Twit = require('twit');
    var Jimp = require("jimp");
    var config = require('./config');

    // Initialize new Twit instance
    var T = new Twit(config);

    var addTextToImage = function (text, output_image_file, success_callback) {
        console.log('Getting a random image from Unsplash...');
        Jimp.read('https://unsplash.it/400/600/?random').then(function (image) {
            // Text font
            var text_font = Jimp.FONT_SANS_32_WHITE;

            // Left margin
            var text_x_offset = 20;

            // Top margin
            var text_y_offset = 20;

            // Text max width.
            // Value lower than the image width may make the text get wrapped.
            var text_max_width = 2;

            // If text is wrapped and there are more than 15 words, change to a smaller font.
            if (text_max_width <= 2 && text.split(' ').length > 15) {
                text_font = Jimp.FONT_SANS_16_WHITE;
            }

            // Process the image
            image.brightness(-0.5);

            // Add text to the image
            console.log('Adding text to the image...');
            Jimp.loadFont(text_font).then(function (font) {
                image.print(font, text_x_offset, text_y_offset, text, text_max_width)
                    .write(output_image_file, success_callback);
            });
        }).catch(function (err) {
            console.log(err);
        });
    };

    var postTweetImage = function (image_file, alt_text, tweet) {
        var fs = require('fs');
        var b64content = fs.readFileSync(image_file, { encoding: 'base64' });

        // Upload the image first
        console.log('Uploading the image...');
        T.post('media/upload', { media_data: b64content }, function (err, data, response) {
            if (!err) {
                var media_id = data.media_id_string;
                var meta_params = {
                    media_id: media_id,
                    alt_text: {
                        text: alt_text
                    }
                };

                // Assign alt text to the uploaded media, for use by screen readers and
                // other text-based presentations and interpreters
                T.post('media/metadata/create', meta_params, function (err, data, response) {
                    if (!err) {
                        var params = {
                            status: tweet || '',
                            media_ids: [ media_id ]
                        };

                        // Post the tweet
                        console.log('Sending tweet...');
                        T.post('statuses/update', params, function (err, data, response) {
                            if (!err) {
                                console.log('Tweet sent!');
                            } else {
                                console.log(err);
                            }
                        });
                    } else {
                        console.log(err);
                    }
                });
            } else {
                console.log(err);
            }
        });
    };

    var stream = T.stream('user');
    stream.on('direct_message', function (data) {
        console.log('Reading new direct message...');
        var dm_text = data.direct_message.text;
        var tmp_img = 'tmp/image_tmp.jpg';
        addTextToImage(dm_text, tmp_img, function () {
            postTweetImage(tmp_img, dm_text);
        });
    });
})();
