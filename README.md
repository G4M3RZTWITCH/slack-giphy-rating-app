# slack-giphy-rating-app
add a slash command to find the most reacted giphy post in the current chat

1) create a slack app and host the service somewhere
2) get the BOT token, and signing secret to update the .env file respectively
  -you'll also need your Giphy BOTs id and update the .env file
3) give your BOT OAuth permissions and invite it to any channels it needs.
4) update the event URL to your hosted app url.  (may need to add /slack/events)
5) create a slash command for /commsreport


helpful documentation: https://api.slack.com/start/building/bolt-js
