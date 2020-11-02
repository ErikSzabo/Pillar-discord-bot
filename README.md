# Pillar the discord bot

Discord bot that can play music, setup reminders, managing welcome and leaving messages.

## To develop

```
npm install
npm run dev
```

## To use

You will need to have a setup a mongo database.

```
npm install
npm run build
npm start
```

You will need the **language-files** directory next to the **dist** after the build as well!

Bot is currently in **beta**. If you find any problem open an issue please.

**Invite link** for the beta: https://discord.com/api/oauth2/authorize?client_id=751808514732589076&permissions=3374080&scope=bot
**This bot is still in beta, there might be performance or other issues!**
If you want, you can host it for your servers locally.

**It's highly recommended to setup the moderation role (with !set-role mod @role)** If you don't set it up, everyone can change you music channel, your welcome channel, and even the moderation role. By default every restrictions are turned off, and **users with administrator permission can bypass every restriction!**

**Reminders**

- Reminders will trigger 1 week / 3 days / 3 hours before the event, and at the time of the event. (will be customizable in the future)
- Reminders are using **UTC** time by default.
- You can change the time zone with the **!timezone \[zone]**
- Timezone changing is important if you want to sync the time between yours and the bots time.
- Currently, all major **USA** and **EU** timezones are supported.
- You can view the supported timezones with the **!timezone** command.

# Setup

1. Invite the bot
2. !set-role mod @your_moderation_role (**recommended to do**)
3. !welcome-channel #your_text_channel (if you don't set this up, there won't be any welcome and leaving messages)
4. If you don't want to allow any channel for annoying music commands, use this: **!music-channel #your-text-channel**

# Commands

Music

- !pause -- paueses the current music
- !play <youtube link or name> -- plays a music by link or name
- !queue -- shows the music queue
- !resume -- resumes the paused music
- !skip -- skips the current music
- !stop -- stops the music and clears the queue
- !volume <number> -- sets or displays the volume
- !music-channel <text channel> -- sets the music channel, by default every channel is allowed, (write 'off' if you want to reset this)

Reminder

- !r-add <mention> <2020.12.24-20:30> "name" "description" -- adds a new reminder
- !r-delete "name" -- deletes a reminder
- !r-info -- displays the currently scheduled reminders

Poll

- !poll "question" "answer1" "answer2" "answerX" -- creates a poll

Welcome-Leave

- !welcome-message <message> -- sets the welcome message for the server, [USER] placeholder can be used, set to "off" to disable
- !leave-message <message> -- sets the leave message for the server, [USER] placeholder can be used, set to "off" to disable
- !welcome-channel <text channel> -- welcome, and leave messages will appear in this channel, set to "off" to disable

General

- !set-role <role type> <role> -- sets the required roles for specific commands
  For help: set-role help
- !language [new language] -- sets the new language for your server
- !timezone [new timezone] -- sets the new timezone for your server, or displays the currently available timezones if no arguments provided
- !help -- displays this help page
