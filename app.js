// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { WebClient, LogLevel } = require("@slack/web-api");

var counter = (acc, curr) => {
  return acc + (curr.count || 0);
};
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


  // WebClient insantiates a client that can call API methods
  // When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.ERROR
});


app.command('/commsreport', async ({ ack, payload, say }) => {
  ack();
  // Store message
  const winningMessage = await fetchMessage(payload.channel_id);
  const image = winningMessage.blocks.find((block) => {
    return block.type === 'image';
  });
  await say("And the Winner is: " + (image ? image.image_url : 'No one.  No one is the winner.'));
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  
  console.log('⚡️ Bolt app is running!');
})();




let messages;
// Fetch conversation history using the ID and a TS from the last example
async function fetchMessage(id, cursor, currentMessage) {
  console.log('fetching');
  let date = new Date();
  date.setDate(date.getDate()-7);
  const time = date.getTime().toString().slice(0, 10) + '.00000';
  let reqObj = {
    // The token you used to initialize your app
    token: process.env.SLACK_BOT_TOKEN,
    channel: id,
    // In a more realistic app, you may store ts data in a db
    // Limit results
    inclusive: true,
    oldest: time,
    limit: 200
  };
  if (cursor) {
    reqObj.cursor = cursor;
  }
  try {
    // Call the conversations.history method using the built-in WebClient
    const result = await app.client.conversations.history(reqObj);
    // There should only be one result (stored in the zeroth index)
    messages = result.messages.filter((message) => {
      return message.bot_id && message.bot_id === process.env.SLACK_GIPHY_BOT && message.reactions;
    }).sort((a, b) => {
      let bcount = b.reactions.reduce(counter, 0);
      let acount = a.reactions.reduce(counter, 0);
      return bcount - acount;
    });
    const winningMessage = (() => {
      if(messages && messages[0] && (!currentMessage || messages[0].reactions.reduce(counter, 0) > currentMessage.reactions.reduce(counter, 0))){
        return messages[0];
      }
      return currentMessage;
    })()
      
    return result.response_metadata.next_cursor ? fetchMessage(id, result.response_metadata.next_cursor, winningMessage) : winningMessage;

  }
  catch (error) {
    console.error(error);
  }
}