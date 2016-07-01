#!/usr/bin/env node

var readline = require('readline'),
  chalk = require('chalk'),
  fs = require('fs'),
  filename = 'session-secret.json',
  jsonKey = 'session-secret';

require('shelljs/global');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var quest = function(prompt, callback) {
  if (!prompt) {
    prompt = 'Please enter a random sentence. The sentence is used as session secret so enter one with more than 10 letters, e.g.\n' +
      '"I didn\'t think I needed a secret, but the voices in my head told me Express needed one":'
  }
  rl.question(prompt + '\n', function(answer) {
    answer = answer.trim();
    if (!answer.length) {
      quest(chalk.red('please enter a sentence'), callback);
    } else if (answer.length <= 10) {
      quest(chalk.red('sentence to short enter mor than 10 letters'), callback);
    } else {
      rl.close();
      callback(answer);
    }
  });
};

var createSessionSecretFile = function(secret, successFunction) {
  var fileData = {}
  fileData[jsonKey] = secret;
  fs.writeFile(filename, JSON.stringify(fileData , null, '\t'), function(err) {
    if (err) {
      return console.log('Got error:' + err);
    }
    successFunction();
  });
};



if (!test('-f', filename)) {

  quest(false, function(answer){
    createSessionSecretFile(answer, function() {
      console.log(chalk.green('Nice!'), 'Your sentence is:',  chalk.blue.bgRed.bold(answer), 'and saved to', chalk.underline.bgBlue(filename));
    });
  });

} else {
  process.exit(0);
}