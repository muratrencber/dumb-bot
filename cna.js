let imageLinks = ["/can_media/can-kutuphanesi/5.jpg",
"/can_media/6.jpg",
"/can_media/IMG_188020(1).JPG",
"/can_media/Untitled-1.jpg",
"/can_media/can-kutuphanesi/Untitled-3.jpg", 
"/can_media/can-kutuphanesi/15122001.png"];
let shuffledArray= imageLinks;
let remainingImages = 0;
module.exports=
{
    GetImageLink: function()
    {
        if(remainingImages==0)
            Shuffle();
        remainingImages--;
        return shuffledArray[remainingImages];
    }
}
function Shuffle()
{
    shuffledArray = imageLinks;
    for (var i = shuffledArray.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = temp;
    }
    remainingImages = imageLinks.length;
}