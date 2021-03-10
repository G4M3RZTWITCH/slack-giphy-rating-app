// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { WebClient, LogLevel } = require("@slack/web-api");
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
  const image = await fetchMessage(payload.channel_id);
  //await say("And the Winner is: " + (image ? image : 'No one.  No one is the winner.'));
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  
  console.log('⚡️ Bolt app is running!');
})();




let messages;
// Fetch conversation history using the ID and a TS from the last example
async function fetchMessage(id, ts) {
  try {
    // Call the conversations.history method using the built-in WebClient
    const result = await app.client.conversations.history({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
      // In a more realistic app, you may store ts data in a db
      // Limit results
      inclusive: true
    });
    console.log(result.messages.length);

    // There should only be one result (stored in the zeroth index)
    messages = result.messages.filter((message) => {
      return message.bot_id && message.bot_id === process.env.SLACK_GIPHY_BOT && message.reactions;
    }).sort((a, b) => {
      var counter = (acc, curr) => {
        return acc + (curr.count || 0);
      };
      
      let bcount = b.reactions.reduce(counter, 0);
      let acount = a.reactions.reduce(counter, 0);
      return bcount - acount;
    });
    const winningMessage = messages[0];
    const image = winningMessage.blocks.find((block) => {
      return block.type === 'image';
    });
    return image ? image.image_url : '';
  }
  catch (error) {
    console.error(error);
  }
}