const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const fs = require('fs');
const process = require('process');

process.chdir(__dirname);

if (!fs.existsSync('config.json')) {
    console.log('Generating config.json');
    fs.copyFileSync('config.default.json', 'config.json');
}

const config = require('./config.json');

if (!config.token || config.token == 'your-token-goes-here') {
    console.error('No token found in config.json');
    console.error('Please add the bot\'s token to the config.json');
    process.exit(1);
}

const TOKEN = config.token;

const ADMIN_ROLE = '295432346927104000';
const TODO_LIST = '728302319300509707';

const BUGS_CHANNEL = '579870375354040340';
const SUGGESTIONS_CHANNEL = '615023024260775946';

const TODO_CHANNELS = [
    BUGS_CHANNEL,
    SUGGESTIONS_CHANNEL
];

const DONE_EMOJI = '🏁';
const ACCEPTED_EMOJI = '✅';

client.on('ready', () => {
    console.log('PureBot is ready');
    client.user.setPresence({ activity: {name: 'Python v2.7.3'}, status: 'online' });
});

client.on('message', message => {
    if(message.channel.id == TODO_LIST) {
        message.react(DONE_EMOJI);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            return;
        }
    }
    
    const guild = reaction.message.guild;

    guild.members.fetch(user).then(member => {
    
        if (TODO_CHANNELS.indexOf(reaction.message.channel.id) >= 0 && reaction.emoji.name === ACCEPTED_EMOJI && member.roles.cache.has(ADMIN_ROLE)) {
            const todo_list = client.channels.cache.get(TODO_LIST);
            todo_list.send(reaction.message.id + ': ' + reaction.message.author.username + ': ' + reaction.message.content);
        }
    
        if (reaction.message.channel.id == TODO_LIST && reaction.emoji.name === DONE_EMOJI && member.roles.cache.has(ADMIN_ROLE)) {
            if (reaction.message.content.indexOf(': ') > 0) {
                const messageid = reaction.message.content.substr(0, reaction.message.content.indexOf(': '));
                
                TODO_CHANNELS.forEach(channelid => {
                    const channel = client.channels.cache.get(channelid);
                    channel.messages.fetch(messageid).then(message => {
                        let reply = 'This has been completed';
                        
                        if (channelid == BUGS_CHANNEL) {
                            reply = 'This bug has been fixed';
                        } else if (channelid == SUGGESTIONS_CHANNEL) {
                            reply = 'This suggestion has been implemented';
                        }
                        
                        message.channel.send(`> ${message.content}\n${message.author} ${reply} 😄`);
                        message.react(DONE_EMOJI);
                    }).catch(err => {});
                });
            }
            reaction.message.delete();
        }
    
    });
});

client.login(TOKEN);