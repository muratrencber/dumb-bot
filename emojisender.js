const url = process.env.URL || "https://muratrencber.github.io/dumb-bot";
const urlExist = require("url-exist-sync");
const dict = {
    "troll1": "troll1.png",
    "troll2": "troll5.png",
    "amongbitches": "359.jpg",
    "fboi": "",
    "fcat": "",
    "ege1": "",
    "ege2": "",
}

module.exports=
{
    
    GetImageLink: function(key)
    {
        let imgStr = "";
        try
        {
            console.log("trying...");
            imgStr = dict[key];
            console.log("imgStr is: "+imgStr);
            if(imgStr == null  || imgStr == "" || imgStr == undefined)
            {
                imgStr = key;
            }
            else if (DoesURLExist(url+"/emoji_media/"+imgStr))
            {
                return url+"/emoji_media/"+imgStr;
            }
        }
        catch
        {
            imgStr = key;
        }
        if(DoesURLExist(url+"/emoji_media/"+imgStr))
        {
            return url+"/emoji_media/"+imgStr;
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".jpg"))
        {
            return url+"/emoji_media/"+imgStr+".jpg";
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".jpeg"))
        {
            return url+"/emoji_media/"+imgStr+".jpeg";
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".png"))
        {
            return url+"/emoji_media/"+imgStr+".png";
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".gif"))
        {
            return url+"/emoji_media/"+imgStr+".gif";
        }
        return "";
    }
}

function DoesURLExist(url)
{
    const exists = urlExist(url);
    return exists;
}