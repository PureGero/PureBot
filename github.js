const bodyParser = require('body-parser');
const express = require('express');
const { MessageEmbed } = require('discord.js');

const PORT = 4484;

// #just-changelog
// http://ethanbulmer.com:4484/github?channel=448795845031100426
//
// #just-development-changelog
// http://ethanbulmer.com:4484/github?channel=715147323776434246

let client = null;
const app = express();

app.use(bodyParser.json());

app.post('/github', (req, res) => {
  const channel = req.query.channel;
  console.log(`Github push to discord channel ${channel} on branch ${req.body.repository.full_name}`);
  
  let fields = [];
  let totalCharacters = 0;
  
  for (let i = 0; i < req.body.commits.length; i++) {
    const commit = req.body.commits[i];
    
    let name = commit.message;
    let value = ` - ${commit.author.name} [\`${commit.id.substr(0, 7)}\`](${commit.url})`
    if (name.length > 255) {
      name = name.substr(0, 252) + '...';
    }
    
    if ((totalCharacters += name.length + value.length) > 5000) {
      sendMessageEmbed(channel, req.body, fields);
      fields = [];
      totalCharacters = 0;
    }
    
    fields.push({name, value});
  }
  
  sendMessageEmbed(channel, req.body, fields);
  
  res.end();
});

function sendMessageEmbed(channel, body, fields) {
  const embed = new MessageEmbed()
    .setAuthor(body.sender.login, body.sender.avatar_url)
    .setURL(body.compare)
    .setTitle(`[${body.repository.name}:${body.ref.substr(body.ref.lastIndexOf('/') + 1)}] ${fields.length} new commit${fields.length == 1 ? '' : 's'}`)
    //.setColor(0xf1c40f)
    //.setColor(0x00ff00)
    .setColor(randomColor(body.repository.name))
    .addFields(fields);
  
  client.channels.cache.get(channel).send(embed);
}

function randomColor(string) {
  return random(string) * 0x1000000;
}

function random(string) {
  let value = 0;
  
  for (let i = 0; i < string.length; i++) {
    value += Math.sin(string.charCodeAt(i));
  }
  
  return Math.abs((value * 1000) % 1);
}

module.exports = (discordClient) => {
  client = discordClient;
  app.listen(PORT, () => {
    console.log(`Github hook is listening on port ${PORT}`);
  })
}