const https = require("https");
const io = require("socket.io")();
io.listen(9000);

// Bot configs read in from environment
const room_id = process.env.HUBOT_GROUPME_ROOM_ID;
const bot_id = process.env.HUBOT_GROUPME_BOT_ID;
const token = process.env.HUBOT_GROUPME_TOKEN;

if (!room_id || !bot_id || !token) {
  console.error(
    `@all ERROR: Unable to read full environment.
    Did you configure environment variables correctly?
    - HUBOT_GROUPME_ROOM_ID
    - HUBOT_GROUPME_BOT_ID
    - HUBOT_GROUPME_TOKEN`
  );
  process.exit(1);
}

class AllBot {
  constructor(robot) {
    this.robot = robot;
    this.blacklist = [];

    // Load the blacklist as soon as we can
    this.robot.brain.once("loaded", this.loadBlacklist.bind(this));
  }

  saveBlacklist() {
    console.log("Saving blacklist");
    this.robot.brain.set("blacklist", this.blacklist);
    this.robot.brain.save();
  }

  loadBlacklist() {
    this.blacklist = this.robot.brain.get("blacklist");
    if (this.blacklist) console.log("Blacklist loaded successfully.");
    else console.warn("Failed to load blacklist.");
  }

  addToBlacklist(item) {
    this.blacklist.push(item);
    this.saveBlacklist();
  }

  removeFromBlacklist(item) {
    let index = this.blacklist.indexOf(item);
    if (index !== -1) {
      this.blacklist.splice(index, 1);
      this.saveBlacklist();
      console.log(`Successfully removed ${item} from blacklist.`);
    } else {
      console.warn(`Unable to find ${item} in blacklist!`);
    }
  }

  getUserByName(_name) {
    let name = _name.trim();
    if (name[0] == "@") {
      name = name.slice(1);
    }
    let user = this.robot.brain.userForName(name);
    if (!user.user_id) return null;
    else return user;
  }

  getUserById(id) {
    let user = this.robot.brain.userForId(id);
    if (!user.user_id) return null;
    else return user;
  }

  respondToID(res, target) {
    // Get ID command
    console.log(`Looking for user ID by name: ${target}`);
    const found = this.getUserByName(target);

    if (found) {
      const id = found.user_id;
      console.log(`Found ID ${id} by name ${target}`);
      res.send(`${target}: ${id}`);
    } else {
      res.send(`Could not find a user with the name ${target}`);
    }
  }

  respondToName(res, target) {
    console.log(`Looking for user name by ID: ${target}`);
    const found = this.getUserById(target);

    if (found) {
      const name = found.name;
      console.log(`Found name ${name} by ID ${target}`);
      res.send(`${target}: ${name}`);
    } else {
      res.send(`Could not find a user with the ID ${target}`);
    }
  }

  respondToViewBlacklist(res) {
    // Raw blacklist
    if (res.match[1]) return res.send(JSON.strinify(this.blacklist));

    const blacklistNames = this.blacklist.map(
      user => this.getUserById(id).name
    );

    if (blacklistNames.length > 0) return res.send(blacklistNames.join(", "));
    else return res.send("There are currently no users blacklisted.");
  }

  respondToBlacklist(res, target) {
    const user = this.getUserByName(target);

    if (!user) return res.send(`Could not find a user with the name ${target}`);

    conosle.log(`Blacklisting ${target}, ${user.user_id}`);
    this.addToBlacklist(user.user_id);
    res.send(`Blacklisted ${target} successfully.`);
  }

  respondToWhitelist(res, target) {
    const user = this.getUserByName(target);

    if (!user) return res.send(`Could not find a user with the name ${target}`);

    console.log(`Whitelisting ${target}, ${user.user_id}`);
    this.removeFromBlacklist(user.user_id);
    res.send(`Whitelisted ${target} successfully`);
  }

  respondToAtAll(res) {
    // Select the longer of the two options.
    // TODO: Maybe combine them?
    const text =
      res.match[0].length > res.match[1].length ? res.match[0] : res.match[1];

    // Default text if not long enough
    // TODO: Is this necessary? Can't we tag everyone on a 1 character message?
    // if (text.length < users.length)
    //   text = "Please check the GroupMe, everyone.";

    // The message for use in GroupMe API
    const message = {
      text,
      bot_id,
      attachments: [{ loci: [], type: "mentions", user_ids: [] }]
    };

    // Add "mention" for each user
    const users = this.robot.brain.users();
    Object.keys(users).map((userID, index) => {
      // Skip blacklisted users
      if (this.blacklist.indexOf(userID) !== -1) return;

      // TODO: Would [i, i] work?
      message.attachments[0].loci.push([index, index + 1]);
      message.attachments[0].user_ids.push(userID);
    });

    // Send the request
    const json = JSON.stringify(message);
    const groupmeAPIOptions = {
      agent: false,
      host: "api.groupme.com",
      path: "/v3/bots/post",
      port: 443,
      method: "POST",
      headers: {
        "Content-Length": json.length,
        "Content-Type": "application/json",
        "X-Access-Token": token
      }
    };
    const req = https.request(groupmeAPIOptions, response => {
      let data = "";
      response.on("data", chunk => (data += chunk));
      response.on("end", () =>
        console.log(`[GROUPME RESPONSE] ${response.statusCode} ${data}`)
      );
    });
    req.end(json);
  }
  
  respondToPuppies(res) {
    const text = "PUPPIES!!!!";

    // The message for use in GroupMe API
    const message = {
      text,
      bot_id,
      attachments: [{type: "image", url:"https://i.groupme.com/360x265.gif.c6efe48e69d0485fbc3da95538f12f77.large" }]
    };

    // Send the request
    const json = JSON.stringify(message);
    const groupmeAPIOptions = {
      agent: false,
      host: "api.groupme.com",
      path: "/v3/bots/post",
      port: 443,
      method: "POST",
      headers: {
        "Content-Length": json.length,
        "Content-Type": "application/json",
        "X-Access-Token": token
      }
    };
    const req = https.request(groupmeAPIOptions, response => {
      let data = "";
      response.on("data", chunk => (data += chunk));
      response.on("end", () =>
        console.log(`[GROUPME RESPONSE] ${response.statusCode} ${data}`)
      );
    });
    req.end(json);
  }
  
  respondToBobby(res) {
    const text = "Bobby Loves You";

    // The message for use in GroupMe API
    const message = {
      text,
      bot_id,
      attachments: [{type: "image", url:"https://i.groupme.com/360x640.gif.fe1835f6219645ce9f47fd443d2dcd06.large" }]
    };

    // Send the request
    const json = JSON.stringify(message);
    const groupmeAPIOptions = {
      agent: false,
      host: "api.groupme.com",
      path: "/v3/bots/post",
      port: 443,
      method: "POST",
      headers: {
        "Content-Length": json.length,
        "Content-Type": "application/json",
        "X-Access-Token": token
      }
    };
    const req = https.request(groupmeAPIOptions, response => {
      let data = "";
      response.on("data", chunk => (data += chunk));
      response.on("end", () =>
        console.log(`[GROUPME RESPONSE] ${response.statusCode} ${data}`)
      );
    });
    req.end(json);
  }
  
  respondToLouise(res) {
    const text = "Louise Loves You";

    // The message for use in GroupMe API
    const message = {
      text,
      bot_id,
      attachments: [{type: "image", url:"https://i.groupme.com/720x1280.jpeg.9284728bcd8f4d298aee19c863ad842b.large" }]
    };

    // Send the request
    const json = JSON.stringify(message);
    const groupmeAPIOptions = {
      agent: false,
      host: "api.groupme.com",
      path: "/v3/bots/post",
      port: 443,
      method: "POST",
      headers: {
        "Content-Length": json.length,
        "Content-Type": "application/json",
        "X-Access-Token": token
      }
    };
    const req = https.request(groupmeAPIOptions, response => {
      let data = "";
      response.on("data", chunk => (data += chunk));
      response.on("end", () =>
        console.log(`[GROUPME RESPONSE] ${response.statusCode} ${data}`)
      );
    });
    req.end(json);
  }
  
  respondToWinston(res) {
    const text = "Winston Loves You";

    // The message for use in GroupMe API
    const message = {
      text,
      bot_id,
      attachments: [{type: "image", url:"https://i.groupme.com/1536x2048.jpeg.a739d3a617d44c8d8719722ce699110e.large" }]
    };

    // Send the request
    const json = JSON.stringify(message);
    const groupmeAPIOptions = {
      agent: false,
      host: "api.groupme.com",
      path: "/v3/bots/post",
      port: 443,
      method: "POST",
      headers: {
        "Content-Length": json.length,
        "Content-Type": "application/json",
        "X-Access-Token": token
      }
    };
    const req = https.request(groupmeAPIOptions, response => {
      let data = "";
      response.on("data", chunk => (data += chunk));
      response.on("end", () =>
        console.log(`[GROUPME RESPONSE] ${response.statusCode} ${data}`)
      );
    });
    req.end(json);
  }
  
  respondToFYRuss(res) {
    return res.send("Russ is a fine fellow. Do not use his name in vain.");
  }
  
  respondToDorkDrive(res) {
    return res.send("Dork Drive: https://drive.google.com/drive/folders/11l-ZTZ0is9L6yNUyEB623TA8oEYMNupd");
  }
  
  respondToRoll20(res) {
    return res.send("");
  }

  // Defines the main logic of the bot
  run() {
    // Logging to status socket
    // Register listeners with hubot
    this.robot.hear(/get id (.+)/i, res => this.respondToID(res, res.match[1]));
    this.robot.hear(/get name (.+)/i, res =>
      this.respondToName(res, res.match[1])
    );
    // Mention @all command
    this.robot.hear(/(.*)@all(_yall)?(.*)/i, res => this.respondToAtAll(res));
    // Gentle Puppies
    this.robot.hear(/gentle puppies/i, res => this.respondToPuppies(res));
    // Bobby and Louise
    this.robot.hear(/hey bobby/i, res => this.respondToBobby(res));
    this.robot.hear(/hey louise/i, res => this.respondToLouise(res));
    // Winston
    this.robot.hear(/hey winston/i, res => this.respondToWinston(res));
    //FYRuss
    this.robot.hear(/fuck you russ/i, res => this.respondFYRuss(res));
    //Dorkdrive
    this.robot.hear(/!dorkdrive/i, res => this.respondToDorkDrive(res));
    //Roll20
    this.robot.hear(/!dorkdrive/i, res => this.respondToRoll20(res));
  }
}

module.exports = robot => {
  const bot = new AllBot(robot);
  bot.run();
};
