# TODO

- [ ] Add logging
- [x] Limit reminders to 50/server against possible attacks
- [ ] Limit joined servers number to a 100 for now (beacuse of the need of the verification)
- [ ] Check if permission checks are performed everywhere it's needed.
- [ ] Index databases
  - ServerInfo database with serverID
  - Reminders database for serverID and title
- [ ] change prefix for something that is not "already taken"
- [ ] If the bot is already playing music in a channel, and you aren't with the bot, you shouldn't have access to the play command
  - play command little refactor
- [ ] Always perfrom database opertaions first, and only after the cache opertaions when its succeeds.
- [ ] info commands
  - for server information (!info - general command)
  - for reminder list (!reminders - reminder command)
- [ ] should send messages what is playing now
- [ ] enchance language command
  - if it is just !language without params, then display the available locales.
