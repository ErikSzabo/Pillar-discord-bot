# TODO

- [x] Add logging
- [x] Limit reminders to 50/server against possible attacks
- [x] Limit joined servers number to a 100 for now (beacuse of the need of the verification)
- [x] Index databases
  - ServerInfo database with serverID
  - Reminders database for serverID and title
- [x] change prefix for something that is not "already taken"
- [x] If the bot is already playing music in a channel, and you aren't with the bot, you shouldn't have access to the play command
  - play command little refactor
- [x] Always perfrom database opertaions first, and only after the cache opertaions when its succeeds.
- [x] info command
  - for reminder list (!reminders - reminder command)
- [x] should send messages what is playing now
- [x] enchance language command
  - if it is just !language without params, then display the available locales.
- [x] Add operator id to the config
  - Opertor user should have access to reload the language files.
