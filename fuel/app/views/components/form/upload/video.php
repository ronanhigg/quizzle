<?/*<video src="<?=$value?>" width="512" height="288" controls></video>*/?>

<object id="MediaPlayer" width="512" height="355" classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" standby="Loading Windows Media Player components..." type="application/x-oleobject" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">

<param name="filename" value="http://yourdomain/yourmovie.wmv">
<param name="Showcontrols" value="True">
<param name="autoStart" value="True">
<param name="wmode" value="transparent">

<embed type="application/x-mplayer2" src="<?=$value?>" name="MediaPlayer" autoStart="False" wmode="transparent" width="512" height="355" ></embed>

</object>