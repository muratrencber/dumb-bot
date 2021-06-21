const Discord=require("discord.js");
const Canvas = require('canvas');
const Sequelize=require("sequelize");
const cron = require('cron');

const client=new Discord.Client();
const TOKEN =  process.env.BOT_TOKEN || "";
const BOT_ID = process.env.BOT_ID || "787349305480577055";
client.login(TOKEN);

const cikralayici=require("./cikralayici.js");
const cna = require("./cna.js")
const emojisender = require("./emojisender.js")
const ehb=require("./ehb.js");
const IMDBScrapper = require("imdb-scraper");
const imdb = new IMDBScrapper({});
const imdb2 = require('imdb-node-api');
const maxcontenders = 128;
const urlExist = require("url-exist-sync");

let channel = null;
let guildid = "";
let tournamentJob;

const MURAT_ID = "300626846221860867";
const KINOBOT_ID = process.env.KINOBOT_ID || "718996755596967966";
const KINOCHANNEL_ID = process.env.KINOCHANNEL_ID || "826466952200716298";
const DATABASE_NAME = process.env.DATABASE_NAME || "testdatabase";
const DATABASE_USERNAME = process.env.DATABASE_USERNAME || "postgres";
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "123";
const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
const DATABASE_PORT = process.env.DATABASE_PORT || 5432;
const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
    	host: DATABASE_HOST,
    	dialect: "postgres",
    	port: DATABASE_PORT,
	dialectOptions: {
    		ssl: {
      			require: true,
      			rejectUnauthorized: false
    		}
	},
});

const Tournaments = sequelize.define("tournaments", {
    guildID: { type: Sequelize.STRING, },
    contenders: { type: Sequelize.STRING(2048), },
    channel: { type: Sequelize.STRING, },
    status: { type: Sequelize.INTEGER, }
})
const Contenders = sequelize.define("contenders",{
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    health:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    strength:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    intelligence:{  
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    agility:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    charisma:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    item:{   
        type: Sequelize.STRING,
    },
    guildID:
    {
        type: Sequelize.STRING,
    },
    imageURL:
    {
        type: Sequelize.STRING(2048),
    },
});
const Items = sequelize.define("items", {
    key: {
        type: Sequelize.STRING,
        unique: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    strength:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    intelligence:{  
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    agility:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    charisma:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    health:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    guildID:
    {
        type: Sequelize.STRING,
    },
    imageURL:
    {
        type: Sequelize.STRING(2048),
    },
})

client.once("ready", ()=>{
    sequelize.sync({alter: true});
});

client.on("message", async mess=>{
    channel = mess.channel;
    guildid = channel.guild.id;
    const message = mess.content;
    /*if(channel.id == KINOCHANNEL_ID)
    {
        console.log("MENTLENGTH:"+mess.mentions.users.length);
        console.log("FOUND:"+mess.mentions.users.find(KINOBOT_ID));
        if(mess.member.id != KINOBOT_ID && (mess.mentions.users.length == 0 || mess.mentions.users.find(KINOBOT_ID) == null || mess.mentions.users.find(KINOBOT_ID) == undefined))
        {
            return;
        }
    }*/
    if(message.charAt(0) != "!" || mess.author.id == BOT_ID)
    {
        return;
    }
    let cleanMessage = message.substring(1);
    let words = cleanMessage.split(" ");
    if(words.length == 0)
        return;
    let command = words[0].toLowerCase();
    let afterCommand = ReassembleWords(words, 1);
    let sentMessage = "";
    if(command == "ehb" && words.length > 1){
        sentMessage=ehb.EHB();
    }
    else if(command == "çıkrala"){
        if(words.length == 1)
        {
            if(mess.reference != null)
            {
                await mess.channel.messages.fetch(mess.reference.messageID).then(msg => sentMessage = cikralayici.Cikrala(msg.content));
            }
            else
            {
                await mess.channel.messages.fetch({limit: 2})
                .then(messageMappings => {
                let messages = Array.from(messageMappings.values());
                let previousMessage = messages[1];
                sentMessage = cikralayici.Cikrala(previousMessage.content);
                })
            }
        }
        else
            sentMessage=cikralayici.Cikrala(afterCommand);
    }
    else if(command == "yardım" && words.length == 1){
        sentMessage=ShowHelp();
    }
    else if(command == "can" && words.length==1){
        sentMessage=cna.GetImageLink();
    }
    else if(command == "puanla"){
        sentMessage=(Math.floor(Math.random()*10)+1)+"/10";
    }
    else if(command == "emoji")
    {
        if(afterCommand == "liste")
            sentMessage = emojisender.ListEmojis();
        else
            sentMessage=emojisender.GetImageLink(afterCommand);
    }
    else if(command == "avatar")
    {
        
        let user = client.users.cache.find(u => u.username == afterCommand);
        if(user != null)
        {
            channel.send((await user).displayAvatarURL({dynamic:true, size:4096}));
        }
        else
        {
            let guildmember = channel.guild.members.cache.find(m => m.displayName == afterCommand);
            if(guildmember != null)
                afterCommand = guildmember.id;
            try
            {
                user = client.users.fetch(afterCommand);
                if(user != null)
                {
                    channel.send((await user).displayAvatarURL({dynamic:true, size:4096}));
                }
            }
            catch
            {

            }
        }
        mess.mentions.users.each(user => channel.send(user.displayAvatarURL({dynamic:true,
                                                                        size:4096})));
    }
    else if(command == "kino")
    {
        if(afterCommand.includes("https://www.imdb.com/title/") || afterCommand.includes("http://www.imdb.com/title/"))
        {
            afterCommand = afterCommand.replace("https://www.imdb.com/title/", "");
            afterCommand = afterCommand.replace("http://www.imdb.com/title/", "");
            afterCommand = afterCommand.split("/")[0];
            console.log("id is: " + afterCommand);
        }
        channel.send("Aranıyor...").then(movieMessage => {
            imdb2.searchMovies(afterCommand, function (movies) {
                let id = "";
                if(movies.length == 0 || movies[0] == null || movies[0] == undefined)
                {
                    id = afterCommand;
                }
                else
                {
                    id = movies[0].id;
                }
                imdb2.getMovie(id, function (movie) {
                    let result = "";
                    result += "**İsim: **" + movie.title + "\n";
                    if(movie.ratingValue != null)
                        result += "**Puan: **" + movie.ratingValue + "\n";
                    if(movie.director != null)
                        result += "**Yönetmen: **" + movie.director + "\n";
                    else if(movie.creator != null)
                        result += "**Yaratıcı: **" + movie.creator + "\n";
                    if(movie.runtime != null)
                        result += "**Süre: **" + movie.duration + "\n";
                    movieMessage.edit(result);
                    channel.send(movie.poster);
                }, function(error) {
                    movieMessage.edit("Bir şeyler yanlış gitti: " + error);
                });
            }, function(error) {
                movieMessage.edit("Bir şeyler yanlış gitti!");
            });
        })
    }
    else if(command=="vs"){
        let contenders = afterCommand.split(";");
        if(words.length==1)
        {
            let contender1 = await Contenders.findOne({where: {guildID: {[Sequelize.Op.or]:[null,channel.guild.id]}}, order: sequelize.random(), limit: 5 });
            let contender2 = await Contenders.findOne({where: {guildID: {[Sequelize.Op.or]:[null,channel.guild.id]}, name:{[Sequelize.Op.not]:contender1.name}}, order: sequelize.random(), limit: 5 });
            sentMessage = await MakeVersus(contender1, contender2);
        }
        else if(afterCommand.toLowerCase() == "istek")
        {
            sentMessage = "İstek katılımcı/eşyalar için: https://mrtrncbr-dumbbot-requests.herokuapp.com/istek";
        }
        else
        {
            if(contenders.length < 2)
                return;
            else if(contenders.length > maxcontenders)
                sentMessage="Çok fazla katılımcı var! _(Maksimum katılımcı sayısı: "+maxcontenders+")_";
            else
            {
                let databaseUsed=false;
                if(contenders.length == 2)
                {
                    let contender1 = await FindContender(contenders[0], guildid);
                    let contender2 = await FindContender(contenders[1], guildid);
                    if(contender1 != null && contender2 != null)
                    {
                        databaseUsed = true;
                        if(contender1.name == contender2.name)
                            sentMessage="Aynı kişileri niye savaştırıyorsun?";
                        else
                            sentMessage = await MakeVersus(contender1, contender2);
                    }
                }
                if(!databaseUsed)
                {
                    let winnerIndex = Math.floor(Math.random()*contenders.length);
                    let winner = contenders[winnerIndex];
                    sentMessage="Kazanan: "+winner;
                }
            }
        }
    }
    else if(command=="ws")
    {
        let items = afterCommand.split(";");
        if(items.length != 4)
        {
            sentMessage = "Hatalı girdi!";
        }
        else
        {
            let contender1 = await FindContender(items[0], guildid);
            let item1 = await FindItem(items[1], guildid);
            let contender2 = await FindContender(items[2], guildid);
            let item2 = await FindItem(items[3], guildid);
            if(item1 != null && item2 != null && contender1 != null && contender2 != null)
            {
                sentMessage = await MakeVersus(contender1, contender2, item1, item2);
            }
            else
            {
                sentMessage="Belirtilen eşya/savaşçılardan biri veya birkaçı bulunamadı!";
            }
        }
    }
    else if(command=="savaşçılar")
    {
        let contList = await Contenders.findAll({where: {guildID: {[Sequelize.Op.or]:[null,channel.guild.id]}}} ,{attributes: ["name", "key"]});
        sentMessage = ("SAVAŞÇILAR\n"+ contList.map(c=>c.name).join("\n")) || "Savaşçı yok.";
    }
    else if(command=="ayrıntılar")
    {
        let targetContender = await FindContender(afterCommand, guildid);
        if(targetContender != null)
        {
            let targetItem = await FindItem(targetContender.item, guildid);
            let itemName = targetItem != null ? targetItem.name : "Yok";
            sentMessage="İsim: "+targetContender.name+"\n"+
            "Resim: "+targetContender.imageURL+"\n"+
            "Güç: "+targetContender.strength+(targetItem!=null?(", Ek ile: "+(targetContender.strength+targetItem.strength)):"")+"\n"+
            "Zeka: "+targetContender.intelligence+(targetItem!=null?(", Ek ile: "+(targetContender.intelligence+targetItem.intelligence)):"")+"\n"+
            "Çeviklik: "+targetContender.agility+(targetItem!=null?(", Ek ile: "+(targetContender.agility+targetItem.agility)):"")+"\n"+
            "Karizma: "+targetContender.charisma+(targetItem!=null?(", Ek ile: "+(targetContender.charisma+targetItem.charisma)):"")+"\n"+
            "Sağlık: "+targetContender.health+(targetItem!=null?(", Ek ile: "+(targetContender.health+targetItem.health)):"")+"\n"+
            "Eşya: "+itemName;
        }
        else
        {
            let targetItem = await FindItem(afterCommand, guildid);
            if(targetItem != null) {
                sentMessage="Key: "+targetItem.key+"\n"+
                "İsim: "+targetItem.name+"\n"+
                "Resim: "+targetItem.imageURL+"\n"+
                "Güç eklemesi: "+targetItem.strength+"\n"+
                "Zeka eklemesi: "+targetItem.intelligence+"\n"+
                "Çeviklik eklemesi: "+targetItem.agility+"\n"+
                "Karizma eklemesi: "+targetItem.charisma+"\n"+
                "Sağlık eklemesi: "+targetItem.health+"\n";
            }
            else {
                sentMessage = "Obje bulunamadı!";
            }
        }
    }
    else if(command=="eşyalar")
    {
        let contList = await Items.findAll({where: {guildID: {[Sequelize.Op.or]:[null,guildid]}}} ,{attributes: ["name", "key"]});
        sentMessage = ("EŞYALAR\n"+ contList.map(c=>(c.name+" _"+c.key+"_")).join("\n")) || "Eşya yok.";
    }
    else if(command=="eşyaata" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        let itemList = await Items.findAll({where: {guildID: {[Sequelize.Op.or]:[null,guildid]}}} ,{attributes: ["key"]});
        shuffledArray = itemList;
        for (var i = shuffledArray.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffledArray[i];
            shuffledArray[i] = shuffledArray[j];
            shuffledArray[j] = temp;
        }
        let contenderList = await Contenders.findAll({where: {guildID: {[Sequelize.Op.or]:[null,guildid]}}} ,{attributes: ["name"]});
        for(let i =0; i < Math.min(contenderList.length, itemList.length); i++)
        {
            let contenderName = contenderList[i].name;
            let itemKey=itemList[i].key;
            await Contenders.update({item:itemKey}, {where: {name: contenderName}});
        }
        sentMessage="İşlem bitti.";
    }
    else if(command=="eşyaekle"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let args1 = afterCommand.split('" ');
        console.log(args1.length);
        if(args1.length==3)
        {
            let keyName = args1[0].replace('"',"").replace(" ","").replace("^","").replace("[","").replace("]","");
            let existingItem = await FindItem(keyName, guildid);
            if(existingItem && existingItem.guildID == channel.guild.id)
            {
                sentMessage = "Böyle bir eşya zaten var!";
            }
            else
            {
                let itemName = args1[1].replace('"',"");
                let otherArgs = args1[2].split(" ");
                if(otherArgs.length == 5)
                {
                    try
                    {
                        let strength = parseInt(otherArgs[0]);
                        let intelligence = parseInt(otherArgs[1]);
                        let agility = parseInt(otherArgs[2]);
                        let charisma = parseInt(otherArgs[3]);
                        let health = parseInt(otherArgs[4]);

                        await Items.create(
                            {
                                key: keyName,
                                name: itemName,
                                strength: strength,
                                intelligence: intelligence,
                                agility: agility,
                                charisma: charisma,
                                health: health,
                                guildID: channel.guild.id,
                            }
                        );
                        sentMessage="Eşya başarıyla oluşturuldu :partying_face:"
                    }
                    catch(e){sentMessage="Bir şeyler yanlış gitti :("}
                }
                else
                {
                    sentMessage="Bir sıkıntı çıktı! Girdilerinde hata olabilir."
                }
            }
        }
        else
        {
            sentMessage=":thinking: Komutu yarım bırakmış gibisin, girdilerini kontrol et."
        }
        
    }
    else if(command=="savaşçıekle"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let args1 = afterCommand.split('" ');
        if(args1.length==2)
        {
            let contenderName = args1[0].replace('"',"").replace("^","").replace("[","").replace("]","");
            let existingContender=await FindContender(contenderName, guildid);
            if(existingContender && existingContender.guildID == channel.guild.id)
            {
                sentMessage = "Böyle bir savaşçı zaten var!";
            }
            else
            {
                let otherArgs = args1[1].split(" ");
                if(otherArgs.length == 5)
                {
                    console.log("otherargslengths...");
                    try
                    {
                        let strength = parseInt(otherArgs[0]);
                        let intelligence = parseInt(otherArgs[1]);
                        let agility = parseInt(otherArgs[2]);
                        let charisma = parseInt(otherArgs[3]);
                        let health = parseInt(otherArgs[4]);

                        await  Contenders.create(
                            {
                                name: contenderName,
                                strength: strength,
                                intelligence: intelligence,
                                agility: agility,
                                charisma: charisma,
                                health: health,
                                guildID: channel.guild.id,
                            }
                        );
                        sentMessage="Savaşçı başarıyla oluşturuldu :partying_face:"
                    }
                    catch(e){sentMessage="Bir şeyler yanlış gitti :("}
                }
                else
                {
                    sentMessage="Bir sıkıntı çıktı! Girdilerinde hata olabilir."
                }
            }
        }
        else
        {
            sentMessage=":thinking: Komutu yarım bırakmış gibisin, girdilerini kontrol et."
        }
        
    }
    else if(command=="savaşçıresmiekle"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let lastSpaceIndex = afterCommand.lastIndexOf(" ");
        let contenderName = afterCommand.slice(0, lastSpaceIndex);
        let url = afterCommand.slice(lastSpaceIndex + 1);
        let existingContender = await FindContender(contenderName, guildid);
        if(existingContender != null && (existingContender.guildID == guildid || mess.member.id == MURAT_ID))
        {
            await Contenders.update({imageURL: url}, {where: {name: existingContender.name, guildID: existingContender.guildID}});
            sentMessage = "Değiştirildi!";
        }
        else if(existingContender == null)
        {
            sentMessage = "Böyle bir savaşçı yok!";
            sentMessage = "Değiştirildi!";
        }
    }
    else if(command=="eşyaresmiekle"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let lastSpaceIndex = afterCommand.lastIndexOf(" ");
        let itemName = afterCommand.slice(0, lastSpaceIndex);
        let url = afterCommand.slice(lastSpaceIndex + 1);
        let existingItem = await FindItem(itemName, guildid);
        if(existingItem != null && (existingItem.guildID == guildid || mess.member.id == MURAT_ID))
        {
            await Items.update({imageURL: url}, {where: {key: existingItem.key, guildID: existingItem.guildID}});
            sentMessage = "Değiştirildi!";
        }
        else if(existingItem == null)
        {
            sentMessage = "Böyle bir eşya yok!";
        }
    }
    else if(command=="sil"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let rowCount = await Contenders.destroy({ where: { name: afterCommand, guildID: channel.guild.id} });
        if (!rowCount)
        {
            rowCount = await Items.destroy({ where: { key: afterCommand, guildID: channel.guild.id } });
            if(!rowCount)
                sentMessage="Obje bulunamadı/Objeye erişiminiz yok!"
            else
                sentMessage="Eşya başarıyla silindi."
        }
        else
        {
            sentMessage="Savaşçı başarıyla silindi."
        }
    }
    else if(command=="turnuvakanal" && mess.mentions.channels.first() != null && mess.mentions.channels.first().type == "text" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        let targetChannelID = mess.mentions.channels.first().id;
        let tournament = await Tournaments.findOne({where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
        if(tournament == null)
        {
            await Tournaments.create(
            {
                guildID: mess.guild.id,
                contenders: "",
                channel: targetChannelID,
                status: 0,
            })
        }
        else
        {
            await Tournaments.update({channel: targetChannelID}, {where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
        }
    }
    else if(command=="turnuvabaşlat" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        let tournament = await Tournaments.findOne({where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
        if(tournament == null)
        {
            sentMessage = "Turnuva kanalını seçin!";
        }
        else if(tournament.status == 1)
        {
            sentMessage = "Bir turnuva zaten başlatıldı!";
        }
        else if(tournament.status == 0)
        {
            let contList = await Contenders.findAll({where: {guildID: {[Sequelize.Op.or]:[null,channel.guild.id]}}} ,{attributes: ["name", "key"]});
            let itemList = await Items.findAll({where: {guildID: {[Sequelize.Op.or]:[null,channel.guild.id]}}} ,{attributes: ["name", "key"]});
            if(contList.length < 8)
            {
                sentMessage = "Yeterli savaşçıya sahip değilsiniz. _(En az 16)_";
            }
            else
            {
                let resultString = "|";
                let newContList = []
                for(let i = 0; i < 8; i++)
                {
                    let selectedIndex = Math.floor(Math.random() * contList.length);
                    let selectedContender = contList[selectedIndex];
                    let itemKey = "";
                    if(Math.random() * 100 > 50 && itemList.length > 0)
                    {
                        let selectedItemIndex = Math.floor(Math.random() * itemList.length);
                        itemKey = itemList[selectedItemIndex].key;
                        itemList.splice(selectedItemIndex, 1);
                    }
                    newContList.push(selectedContender);
                    contList.splice(selectedIndex, 1);
                    if(i != 0)
                        resultString += "^";
                    resultString += selectedContender.name + "["+itemKey+"]";
                }
                await Tournaments.update({contenders: resultString, status: 1}, {where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
                await ShowTournamentStatus();
            }
        }
        else if(tournament.status == 2)
        {

        }
    }
    else if(command=="debug_turnuva" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        MakeTournamentVersus();
    }
    else if(command=="turnuvaduraklat" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        let tournament = await Tournaments.findOne({where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
        if(tournament == null)
        {
            sentMessage = "Duraklatacak bir turnuva yok!";
        }
        else if(tournament.status == 1 && tournamentJob != null)
        {
            tournamentJob.stop();
        }
    }
    else if(command=="turnuvabitir" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        let tournament = await Tournaments.findOne({where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
        if(tournament == null)
        {
            sentMessage = "Duraklatacak bir turnuva yok!";
        }
        else
        {
            await Tournaments.update({status: 0}, {where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
            if(tournamentJob != null)
                tournamentJob.stop();
        }
    }
    else if(command=="turnuvadurum" && words.length == 1)
    {
        let tournament = await Tournaments.findOne({where: {guildID: {[Sequelize.Op.like]:mess.guild.id}}});
        if(tournament == null)
        {
            sentMessage = "Bir turnuva yok! Oluşturmak için ilk önce turnuva kanalını belirleyin.";
        }
        else
        {
            await ShowTournamentStatus(false);
        }
    }
    else if(command == "çıkratemizle" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        await client.guilds.cache.get(channel.guild.id).channels.cache.forEach(ch => {
            if (ch.type === 'text'){
                ch.messages.fetch({
                    limit: 100
                }).then(messages => {
                    const msgs = messages.filter(m => m.author.id == BOT_ID)
                    msgs.forEach(m => {
                        if(m.content.includes("!çıkrala !çıkraal"))
                            m.delete();
                    })
                })
            } else {
                return;
            }
        })
    }
    else if(command == "flop" && mess.mentions.users.first() != null)
    {
        let canvas = Canvas.createCanvas(1920, 1080);
        let context = canvas.getContext('2d');
        let flop = await Canvas.loadImage('https://sunstruck.games/dumb/emoji_media/flop.jpg');
        let heart = await Canvas.loadImage('https://sunstruck.games/dumb/other/kalp-37858.jpg');
        let profilePicture = await Canvas.loadImage(mess.mentions.users.first().displayAvatarURL({size: 1024, format: 'png'}));
        context.drawImage(flop, 960, 0, 960, 1080);
        context.drawImage(profilePicture, 0, 0, 960, 1080);
        context.drawImage(heart, 789, 360, 360, 360);
        let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'flop.jpg');
        channel.send("F L O P L A N D I N", attachment);
    }
    if(sentMessage!="")
        SendMessage(sentMessage, channel);
})
client.on("ready", ()=>{
    client.user.setPresence({status:"online"});
    client.user.setActivity('!yardım', {type:"PLAYING"});
});
/*client.on("guildMemberUpdate", (oldMember, newMember)=>
{
    console.log(oldMember.id);
    if(oldMember.id==umut_id&& oldMember.displayName != newMember.displayName && newMember.nickname != null)
    {
        let targetChannel = oldMember.guild.channels.cache.filter(chx => chx.type === "text").find(x => x.name =="dumb-bot");
        if(targetChannel==null)
            targetChannel = oldMember.guild.channels.cache.filter(chx => chx.type === "text").find(x => x.position === 0);
		SendMessage("mal umut", targetChannel);
    }
})*/

var widthTable = [38, 277, 512, 749, 988, 1226, 1462, 1699, 160, 624, 1101, 1577, 377, 1321, 869];
var heightTable = [855, 855, 855, 855, 855, 855, 855, 855, 610, 610, 610, 610, 263, 263, 31];

async function ShowTournamentStatus(sendToTargetChannel = true)
{
    let tournament = await Tournaments.findOne({where: {guildID: {[Sequelize.Op.like]:guildid}}});
    if(tournament != null)
    {
        let originalString = tournament.contenders;
        let tournamentString = originalString.replace("|", "");
        let elements = tournamentString.split("^"); //183*182
        let canvas = Canvas.createCanvas(1920, 1080);
        let context = canvas.getContext('2d');
        let background = await Canvas.loadImage('https://sunstruck.games/dumb/versus/background.jpg');
        let borders = await Canvas.loadImage('https://sunstruck.games/dumb/versus/borders.png');
        context.drawImage(background, 0, 0, 1920, 1080);
        for(let i = 0; i < elements.length; i++)
        {
            let selectedElement = elements[i];
            let contenderName = selectedElement.split("[")[0];
            let selectedContender = await FindContender(contenderName, guildid);
            if(selectedElement == null)
                continue;
            let selectedImage = await Canvas.loadImage(selectedContender.imageURL);
            context.drawImage(selectedImage, widthTable[i], heightTable[i], 183, 182);
        }
        context.drawImage(borders, 0, 0, 1920, 1080);
        let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'turnuvadurum.jpg');
        let targetChannel = channel;
        if(sendToTargetChannel)
            client.channels.fetch(tournament.channel).then(ch => targetChannel = ch);
        targetChannel.send("Güncel Turnuva Durumu:", attachment);
    }
}

async function MakeTournamentVersus()
{
    let tournament = await Tournaments.findOne({where: {guildID: {[Sequelize.Op.like]:guildid}}});
    
    let targetChannel = channel;
    if(tournament != null)
        client.channels.fetch(tournament.channel).then(ch => targetChannel = ch);
    if(tournament != null && tournament.status == 0)
    {
        targetChannel.send("Turnuva oluşturulmadı!");
    }
    else if(tournament != null)
    {
        let originalString = tournament.contenders;
        let tournamentString = originalString.split("|")[1];
        let elements = tournamentString.split("^");

        let contender1Name = elements[0].split("[")[0];
        let contender1Item = elements[0].split("[")[1].split("]")[0];

        let contender2Name = elements[1].split("[")[0];
        let contender2Item = elements[1].split("[")[1].split("]")[0];

        let contender1 = await FindContender(contender1Name, guildid);
        let contender2 = await FindContender(contender2Name, guildid);
        let item1 = contender1Item == "" ? null : FindItem(contender1Item, guildid);
        let item2 = contender2Item == "" ? null : FindItem(contender2Item, guildid);

        let results = await MakeVersusTournament(contender1, contender2, item1, item2);

        let canvas = Canvas.createCanvas(1024, 512);
        let context = canvas.getContext('2d');
        let winnerImage = await Canvas.loadImage(results[0].imageURL);
        let loserImage = await Canvas.loadImage(results[1].imageURL);
        let loserCross = await Canvas.loadImage("https://sunstruck.games/dumb/versus/loser.png");
        context.drawImage(winnerImage, 0, 0, 512, 512);
        context.drawImage(loserImage, 512, 0, 512, 512);
        context.drawImage(loserCross, 512, 0, 512, 512);
        let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'versussonuc.jpg');
        targetChannel.send(results[4], attachment);

        let newString = originalString.split("|")[0];
        for(let i = 0; i < elements.length; i++)
        {
            newString += elements[i] += "^";
            if(i == 1)
                newString += "|";
        }

        let winnerItemKey = results[2] != null ? results[2].key : "";
        let loserItemKey = results[3] != null ? results[3].key : "";

        if(loserItemKey != "" && (Math.random() * 100) > 90)
        {
            winnerItemKey = loserItemKey;
            let infoMessage = results[0].name +", " + results[3].name + " eşyasını aldı!";
            canvas = Canvas.createCanvas(1024, 512);
            context = canvas.getContext('2d');
            winnerImage = await Canvas.loadImage(results[0].imageURL);
            itemImage = await Canvas.loadImage(results[3].imageURL);
            context.drawImage(winnerImage, 0, 0, 512, 512);
            context.drawImage(itemImage, 512, 0, 512, 512);
            attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'esyaalim.jpg');
            targetChannel.send(infoMessage, attachment);
        }

        newString += results[0].name+"["+winnerItemKey+"]";
        let isLast = newString.split("^").length == 15;
        let status = isLast ? 0 : 1;

        await Tournaments.update({contenders: newString, status: status}, {where: {guildID: {[Sequelize.Op.like]:guildid}}});
        if(!isLast)
            await ShowTournamentStatus();
        else
        {
            canvas = Canvas.createCanvas(512, 512);
            context = canvas.getContext('2d');
            winnerImage = await Canvas.loadImage(results[0].imageURL);
            context.drawImage(winnerImage, 0, 0, 512, 512);
            attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'kazanan.jpg');
            targetChannel.send("KAZANAN: "+results[0].name, attachment);
        }
    }
    else if(tournamentJob != null)
    {
        tournamentJob.stop();
    }
}

function ReassembleWords(wordArray, startIndex = 0)
{
    let str = "";
    for(let i = startIndex; i<wordArray.length; i++)
    {
        str += wordArray[i];
        if(i < wordArray.length-1)
            str+=" ";
    }
    return str;
}

function ShowHelp()
{
    return helpText = '```!yardım -> Yardım\n!ehb <soru> -> Sorulan soruya "Evet, hayır, belki" diye cevap verir.\n!çıkrala <metin> -> Çıkralar.\n!can -> Can.\n!emoji <isim> -> Emoji gönderir. \n!emoji liste -> Mevcut emojileri listeler. \n!kino <film ismi> -> IMDb veritabanında bulduğu filmi döndürür (ŞU ANLIK KAPALI). \n!avatar <kullanıcıadı/id/etiket> Belirtilen üyenin profil resmini döndürür.\n!puanla <şey> -> Puanlar.\n!vs <rakip1>;<rakip2>;<rakip3>;......;<rakipn> -> Versus.\n!vs -> Veritabanındaki karakterlerle versus.\n!vs istek -> İstek sitesine yönlendirir.\n!ws <savaşçı1>;<eşya1>;<savaşçı2>;<eşya2> -> Belirtilen savaşçılar ve eşyalar ile versus.\n!savaşçılar -> Veritabanındaki versus katılımcılarını gösterir.\n!eşyalar -> Veritabanındaki eşyaları gösterir.\n!ayrıntılar <objeismi> -> Savaşçı/Eşyayla ilgili ayrıntılı bilgiler.\n\n\nYÖNETİCİLER TARAFINDAN UYGULANABİLİR KOMUTLAR\n!eşyaata -> Veritabanındaki eşyaları rastgele savaşçılara dağıtır.\n!eşyaekle "<eşyaanahtarı>" "<eşyaismi>" <güçeki> <zekaeki> <çeviklikeki> <karizmaeki> <sağlıkeki> -> Eşya oluşturur.\n!savaşçıekle "<savaşçıismi>" <güç> <zeka> <çeviklik> <karizma> <sağlık> -> Savaşçı oluşturur\n!sil <savaşçıismi/eşyaanahtarı> -> Belirtilen eşya/savaşçıyı siler.```';
}

function SendMessage(message, channel)
{
    channel.startTyping(1);
    setTimeout(() => {
        channel.send(message);
        channel.stopTyping(true);
    }, (1+(Math.random()*0.5))*1000);
}

async function MakeVersusTournament(contender1, contender2, item1=null, item2=null)
{
    let message = contender1.name+" vs "+contender2.name +"\n";
    let stats1 ={str: 0, agi:0, int:0, char:0, hp:0};
    stats1.str = contender1.strength;
    stats1.agi = contender1.agility;
    stats1.int = contender1.intelligence;
    stats1.char = contender1.charisma;
    stats1.hp = contender1.health;
    if(item1 != null)
    {
        stats1.str += item1.strength;
        stats1.agi += item1.agility;
        stats1.int += item1.intelligence;
        stats1.char += item1.charisma;
        stats1.hp += item1.health;
    }
    let stats2 ={str: 0, agi:0, int:0, char:0, hp:0};
    stats2.str = contender2.strength;
    stats2.agi = contender2.agility;
    stats2.int = contender2.intelligence;
    stats2.char = contender2.charisma;
    stats2.hp = contender2.health;
    if(item2 != null)
    {
        stats2.str += item2.strength;
        stats2.agi += item2.agility;
        stats2.int += item2.intelligence;
        stats2.char += item2.charisma;
        stats2.hp += item2.health;
    }
    let turn = Math.floor(Math.random()*2);
    while(stats1.hp > 0 && stats2.hp > 0)
    {
        turn = turn%2;
        if(turn == 0)
        {
            let damage = stats1.strength + Math.floor(Math.random()*13);
            let defence = Math.max(0, Math.ceil((Math.sign(stats2.agi)*stats2.agi*stats2.agi+Math.sign(stats2.char)*stats2.char*stats2.char+Math.sign(stats2.int)*stats2.int*stats2.int)/(Math.abs(stats2.agi)+Math.abs(stats2.char)+Math.abs(stats2.int))));
            damage = Math.max(damage-defence, 0);
            stats2.hp -= damage;
        }
        else
        {
            let damage = stats2.strength + Math.floor(Math.random()*13);
            let defence = Math.max(0, Math.ceil((Math.sign(stats1.agi)*stats1.agi*stats1.agi+Math.sign(stats1.char)*stats1.char*stats1.char+Math.sign(stats1.int)*stats1.int*stats1.int)/(Math.abs(stats1.agi)+Math.abs(stats1.char)+Math.abs(stats1.int))));
            damage = Math.max(damage-defence, 0);
            stats1.hp -= damage;
        }
        turn++;
    }
    let result = new Array(4);
    let winner = contender1;
    let loser = contender2;
    let loseItem = item2;
    let winItem = item1;
    if(stats1.hp > 0 || stats2.hp > 0)
    {
        winner = stats1.hp > 0 ? contender1 : contender2;
        loser = stats1.hp > 0 ? contender2 : contender1;
        winItem = stats1.hp > 0 ? item1 : item2;
        loseItem = stats1.hp > 0 ? item2 : item1;
    }
    let itemDesc = winItem != null ? winItem.name + " ile " : "";
    message += "SONUÇ: "+loser.name+", rakibi "+winner.name+" tarafından "+itemDesc+"öldürüldü.";
    result[0] = winner;
    result[1] = loser;
    result[2] = winItem;
    result[3] = loseItem;
    result[4] = message;
    return result;
}

async function MakeVersus(contender1, contender2, item1=null, item2=null)
{
    let message = contender1.name+" vs "+contender2.name +"\n";
    let stats1 ={str: 0, agi:0, int:0, char:0, hp:0};
    stats1.str = contender1.strength;
    stats1.agi = contender1.agility;
    stats1.int = contender1.intelligence;
    stats1.char = contender1.charisma;
    stats1.hp = contender1.health;
    if(item1==null)
        item1 = await FindItem(contender1.item, guildid);
    if(item1 != null)
    {
        stats1.str += item1.strength;
        stats1.agi += item1.agility;
        stats1.int += item1.intelligence;
        stats1.char += item1.charisma;
        stats1.hp += item1.health;
    }
    let stats2 ={str: 0, agi:0, int:0, char:0, hp:0};
    stats2.str = contender2.strength;
    stats2.agi = contender2.agility;
    stats2.int = contender2.intelligence;
    stats2.char = contender2.charisma;
    stats2.hp = contender2.health;
    if(item2==null)
        item2 = await FindItem(contender2.item, guildid);
    if(item2 != null)
    {
        stats2.str += item2.strength;
        stats2.agi += item2.agility;
        stats2.int += item2.intelligence;
        stats2.char += item2.charisma;
        stats2.hp += item2.health;
    }
    let turn = Math.floor(Math.random()*2);
    while(stats1.hp > 0 && stats2.hp > 0)
    {
        turn = turn%2;
        if(turn == 0)
        {
            let damage = stats1.strength + Math.floor(Math.random()*13);
            let defence = Math.max(0, Math.ceil((Math.sign(stats2.agi)*stats2.agi*stats2.agi+Math.sign(stats2.char)*stats2.char*stats2.char+Math.sign(stats2.int)*stats2.int*stats2.int)/(Math.abs(stats2.agi)+Math.abs(stats2.char)+Math.abs(stats2.int))));
            damage = Math.max(damage-defence, 0);
            stats2.hp -= damage;
        }
        else
        {
            let damage = stats2.strength + Math.floor(Math.random()*13);
            let defence = Math.max(0, Math.ceil((Math.sign(stats1.agi)*stats1.agi*stats1.agi+Math.sign(stats1.char)*stats1.char*stats1.char+Math.sign(stats1.int)*stats1.int*stats1.int)/(Math.abs(stats1.agi)+Math.abs(stats1.char)+Math.abs(stats1.int))));
            damage = Math.max(damage-defence, 0);
            stats1.hp -= damage;
        }
        turn++;
    }
    if(stats1.hp <=0 && stats2.hp <= 0)
    {
        message+="SONUÇ: Berabere :(";
        return message;
    }
    let winner = stats1.hp > 0 ? contender1 : contender2;
    let loser = stats1.hp > 0 ? contender2 : contender1;
    let winItem = stats1.hp > 0 ? item1 : item2;
    let itemDesc = winItem != null ? winItem.name + " ile " : "";
    message += "SONUÇ: "+loser.name+", rakibi "+winner.name+" tarafından "+itemDesc+"öldürüldü.";
    return message;
}

async function FindContender(contenderName, guildid)
{
    contenderName = contenderName==null?"":contenderName;
    let lastChar = contenderName.charAt(contenderName.length-1);
    if(lastChar == "*")
        contenderName = contenderName.slice(0,contenderName.length-1)+"%";
    let firstChar = contenderName.charAt(0);
    if(firstChar == "*")
        contenderName = "%" +contenderName.slice(1,contenderName.length);
    return await Contenders.findOne({where: {name: {[Sequelize.Op.like]:contenderName},guildID: {[Sequelize.Op.or]:[null,guildid]}}});
}

async function FindItem(keyOrName, guildid)
{
    keyOrName = keyOrName==null?"":keyOrName;
    let lastChar = keyOrName.charAt(keyOrName.length-1);
    if(lastChar == "*")
    keyOrName = keyOrName.slice(0,keyOrName.length-1)+"%";
    let firstChar = keyOrName.charAt(0);
    if(firstChar == "*")
        keyOrName = "%" +keyOrName.slice(1,keyOrName.length);
    let itemFromName = await Items.findOne({where: {name: {[Sequelize.Op.like]:keyOrName},guildID: {[Sequelize.Op.or]:[null,guildid]}}});
    if(itemFromName != null)
        return itemFromName;
    let itemFromKey = await Items.findOne({where: {key: {[Sequelize.Op.like]:keyOrName},guildID: {[Sequelize.Op.or]:[null,guildid]}}});
    return itemFromKey;
}
