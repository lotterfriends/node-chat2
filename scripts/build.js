#!/usr/bin/env node

require('shelljs/global');

rm('-rf', 'public/lib/');

// start
mkdir('-p', 'public/lib');

// bootstrap
mkdir ('-p', 'public/lib/bootstrap');
cp('-R', 'node_modules/bootstrap/dist/*', 'public/lib/bootstrap');

// jquery
mkdir ('-p', 'public/lib/jquery');
cp('-R', 'node_modules/jquery/dist/*', 'public/lib/jquery');


mkdir ('-p', 'public/lib/emojione');
mkdir ('-p', 'public/lib/emojione/assets/sprites');
mkdir ('-p', 'public/lib/emojione/js');
cp('-R', 'node_modules/emojione/assets/sprites/*', 'public/lib/emojione/assets/sprites');
cp('-R', 'node_modules/emojione/lib/js/*', 'public/lib/emojione/js');

// mkdir ('-p', 'public/lib/emojionearea');
// mkdir ('-p', 'public/lib/emojionearea/css');
// mkdir ('-p', 'public/lib/emojionearea/js');
// cp('-R', 'node_modules/emojionearea/css/*', 'public/lib/emojionearea/css');
// cp('-R', 'node_modules/emojionearea/js/*', 'public/lib/emojionearea/js');


// mkdir ('-p', 'public/lib/jquery-textcomplete');
// cp('-R', 'node_modules/jquery-textcomplete/dist/*', 'public/lib/jquery-textcomplete');
