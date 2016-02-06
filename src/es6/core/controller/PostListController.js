/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

var testData = `
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<meta http-equiv="X-UA-Compatible" content="IE=7, IE=9">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>系統組件 -  電腦領域 HKEPC Hardware  - 全港 No.1 PC討論區 - Powered by Discuz!</title>
<meta name="keywords" content="電腦,新聞,硬件,軟件,行動電腦,主機板,處理器,鏳圖卡,記憶體,遊戲,拍攝,體育,交易,pc,news,hardware,software,notebook,mainboard,motherboard,cpu,display,ram,cd,dvd,game,photo,camera,sport,adata,,asrock,asus,ati,delta,gigabyte,his,intel,lg,magic pro,msi,nvidia,samsung,shuttle,everbest,shotting,synnex,core2,athlon,geforce,radeon,eeepc,lunix,windows,xp,vista,mac,apple,ddr3,hdmi,dvi,agp">
<meta name="description" content=" 電腦領域 HKEPC Hardware   - Discuz! Board">
<meta name="generator" content="Discuz! 7.2">
<meta name="author" content="Discuz! Team and Comsenz UI Team">
<meta name="copyright" content="2001-2009 Comsenz Inc.">
<meta name="MSSmartTagsPreventParsing" content="True">
<meta http-equiv="MSThemeCompatible" content="Yes">
<link rel="archives" title="電腦領域 HKEPC Hardware " href="http://www.hkepc.com/forum/archiver/">
<link rel="stylesheet" type="text/css" href="forumdata/cache/style_28_common.css?RO9"><link rel="stylesheet" type="text/css" href="forumdata/cache/scriptstyle_28_post.css?RO9">
<script type="text/javascript" async="" src="http://www.google-analytics.com/ga.js"></script><script type="text/javascript">var STYLEID = '28', IMGDIR = 'images/default', VERHASH = 'RO9', charset = 'utf-8', discuz_uid = 143676, cookiedomain = '.hkepc.com', cookiepath = '/', attackevasive = '0', disallowfloat = 'tradeorder|debate|usergroups|task', creditnotice = '', gid = 0, fid = parseInt('61'), tid = parseInt('0')</script>
<script src="forumdata/cache/common.js?RO9" type="text/javascript"></script>
<script src="include/js/jquery.js?RO9" type="text/javascript"></script>
<style type="text/css">.fb_hidden{position:absolute;top:-10000px;z-index:10001}.fb_reposition{overflow-x:hidden;position:relative}.fb_invisible{display:none}.fb_reset{background:none;border:0;border-spacing:0;color:#000;cursor:auto;direction:ltr;font-family:"lucida grande", tahoma, verdana, arial, sans-serif;font-size:11px;font-style:normal;font-variant:normal;font-weight:normal;letter-spacing:normal;line-height:1;margin:0;overflow:visible;padding:0;text-align:left;text-decoration:none;text-indent:0;text-shadow:none;text-transform:none;visibility:visible;white-space:normal;word-spacing:normal}.fb_reset>div{overflow:hidden}.fb_link img{border:none}
.fb_dialog{background:rgba(82, 82, 82, .7);position:absolute;top:-10000px;z-index:10001}.fb_reset .fb_dialog_legacy{overflow:visible}.fb_dialog_advanced{padding:10px;-moz-border-radius:8px;-webkit-border-radius:8px;border-radius:8px}.fb_dialog_content{background:#fff;color:#333}.fb_dialog_close_icon{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yq/r/IE9JII6Z1Ys.png) no-repeat scroll 0 0 transparent;_background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yL/r/s816eWC-2sl.gif);cursor:pointer;display:block;height:15px;position:absolute;right:18px;top:17px;width:15px}.fb_dialog_mobile .fb_dialog_close_icon{top:5px;left:5px;right:auto}.fb_dialog_padding{background-color:transparent;position:absolute;width:1px;z-index:-1}.fb_dialog_close_icon:hover{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yq/r/IE9JII6Z1Ys.png) no-repeat scroll 0 -15px transparent;_background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yL/r/s816eWC-2sl.gif)}.fb_dialog_close_icon:active{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yq/r/IE9JII6Z1Ys.png) no-repeat scroll 0 -30px transparent;_background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yL/r/s816eWC-2sl.gif)}.fb_dialog_loader{background-color:#f6f7f8;border:1px solid #606060;font-size:24px;padding:20px}.fb_dialog_top_left,.fb_dialog_top_right,.fb_dialog_bottom_left,.fb_dialog_bottom_right{height:10px;width:10px;overflow:hidden;position:absolute}.fb_dialog_top_left{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 0;left:-10px;top:-10px}.fb_dialog_top_right{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 -10px;right:-10px;top:-10px}.fb_dialog_bottom_left{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 -20px;bottom:-10px;left:-10px}.fb_dialog_bottom_right{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 -30px;right:-10px;bottom:-10px}.fb_dialog_vert_left,.fb_dialog_vert_right,.fb_dialog_horiz_top,.fb_dialog_horiz_bottom{position:absolute;background:#525252;filter:alpha(opacity=70);opacity:.7}.fb_dialog_vert_left,.fb_dialog_vert_right{width:10px;height:100%}.fb_dialog_vert_left{margin-left:-10px}.fb_dialog_vert_right{right:0;margin-right:-10px}.fb_dialog_horiz_top,.fb_dialog_horiz_bottom{width:100%;height:10px}.fb_dialog_horiz_top{margin-top:-10px}.fb_dialog_horiz_bottom{bottom:0;margin-bottom:-10px}.fb_dialog_iframe{line-height:0}.fb_dialog_content .dialog_title{background:#6d84b4;border:1px solid #3a5795;color:#fff;font-size:14px;font-weight:bold;margin:0}.fb_dialog_content .dialog_title>span{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yd/r/Cou7n-nqK52.gif) no-repeat 5px 50%;float:left;padding:5px 0 7px 26px}body.fb_hidden{-webkit-transform:none;height:100%;margin:0;overflow:visible;position:absolute;top:-10000px;left:0;width:100%}.fb_dialog.fb_dialog_mobile.loading{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ya/r/3rhSv5V8j3o.gif) white no-repeat 50% 50%;min-height:100%;min-width:100%;overflow:hidden;position:absolute;top:0;z-index:10001}.fb_dialog.fb_dialog_mobile.loading.centered{width:auto;height:auto;min-height:initial;min-width:initial;background:none}.fb_dialog.fb_dialog_mobile.loading.centered #fb_dialog_loader_spinner{width:100%}.fb_dialog.fb_dialog_mobile.loading.centered .fb_dialog_content{background:none}.loading.centered #fb_dialog_loader_close{color:#fff;display:block;padding-top:20px;clear:both;font-size:18px}#fb-root #fb_dialog_ipad_overlay{background:rgba(0, 0, 0, .45);position:absolute;left:0;top:0;width:100%;min-height:100%;z-index:10000}#fb-root #fb_dialog_ipad_overlay.hidden{display:none}.fb_dialog.fb_dialog_mobile.loading iframe{visibility:hidden}.fb_dialog_content .dialog_header{-webkit-box-shadow:white 0 1px 1px -1px inset;background:-webkit-gradient(linear, 0% 0%, 0% 100%, from(#738ABA), to(#2C4987));border-bottom:1px solid;border-color:#1d4088;color:#fff;font:14px Helvetica, sans-serif;font-weight:bold;text-overflow:ellipsis;text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0;vertical-align:middle;white-space:nowrap}.fb_dialog_content .dialog_header table{-webkit-font-smoothing:subpixel-antialiased;height:43px;width:100%}.fb_dialog_content .dialog_header td.header_left{font-size:12px;padding-left:5px;vertical-align:middle;width:60px}.fb_dialog_content .dialog_header td.header_right{font-size:12px;padding-right:5px;vertical-align:middle;width:60px}.fb_dialog_content .touchable_button{background:-webkit-gradient(linear, 0% 0%, 0% 100%, from(#4966A6), color-stop(.5, #355492), to(#2A4887));border:1px solid #2f477a;-webkit-background-clip:padding-box;-webkit-border-radius:3px;-webkit-box-shadow:rgba(0, 0, 0, .117188) 0 1px 1px inset, rgba(255, 255, 255, .167969) 0 1px 0;display:inline-block;margin-top:3px;max-width:85px;line-height:18px;padding:4px 12px;position:relative}.fb_dialog_content .dialog_header .touchable_button input{border:none;background:none;color:#fff;font:12px Helvetica, sans-serif;font-weight:bold;margin:2px -12px;padding:2px 6px 3px 6px;text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0}.fb_dialog_content .dialog_header .header_center{color:#fff;font-size:16px;font-weight:bold;line-height:18px;text-align:center;vertical-align:middle}.fb_dialog_content .dialog_content{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/y9/r/jKEcVPZFk-2.gif) no-repeat 50% 50%;border:1px solid #555;border-bottom:0;border-top:0;height:150px}.fb_dialog_content .dialog_footer{background:#f6f7f8;border:1px solid #555;border-top-color:#ccc;height:40px}#fb_dialog_loader_close{float:left}.fb_dialog.fb_dialog_mobile .fb_dialog_close_button{text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0}.fb_dialog.fb_dialog_mobile .fb_dialog_close_icon{visibility:hidden}#fb_dialog_loader_spinner{animation:rotateSpinner 1.2s linear infinite;background-color:transparent;background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yD/r/t-wz8gw1xG1.png);background-repeat:no-repeat;background-position:50% 50%;height:24px;width:24px}@keyframes rotateSpinner{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.fb_iframe_widget{display:inline-block;position:relative}.fb_iframe_widget span{display:inline-block;position:relative;text-align:justify}.fb_iframe_widget iframe{position:absolute}.fb_iframe_widget_fluid_desktop,.fb_iframe_widget_fluid_desktop span,.fb_iframe_widget_fluid_desktop iframe{max-width:100%}.fb_iframe_widget_fluid_desktop iframe{min-width:220px;position:relative}.fb_iframe_widget_lift{z-index:1}.fb_hide_iframes iframe{position:relative;left:-10000px}.fb_iframe_widget_loader{position:relative;display:inline-block}.fb_iframe_widget_fluid{display:inline}.fb_iframe_widget_fluid span{width:100%}.fb_iframe_widget_loader iframe{min-height:32px;z-index:2;zoom:1}.fb_iframe_widget_loader .FB_Loader{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/y9/r/jKEcVPZFk-2.gif) no-repeat;height:32px;width:32px;margin-left:-16px;position:absolute;left:50%;z-index:4}</style></head>

<body id="post" onkeydown="if(event.keyCode==27) return false;">
<div id="fb-root" class=" fb_reset"><script src="http://connect.facebook.net/en_US/all.js" async=""></script><div style="position: absolute; top: -10000px; height: 0px; width: 0px;"><div></div></div><div style="position: absolute; top: -10000px; height: 0px; width: 0px;"><div><iframe name="fb_xdm_frame_http" frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no" title="Facebook Cross Domain Communication Frame" aria-hidden="true" tabindex="-1" id="fb_xdm_frame_http" src="http://staticxx.facebook.com/connect/xd_arbiter.php?version=42#channel=f9070f98&amp;origin=http%3A%2F%2Fwww.hkepc.com" style="border: none;"></iframe><iframe name="fb_xdm_frame_https" frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no" title="Facebook Cross Domain Communication Frame" aria-hidden="true" tabindex="-1" id="fb_xdm_frame_https" src="https://staticxx.facebook.com/connect/xd_arbiter.php?version=42#channel=f9070f98&amp;origin=http%3A%2F%2Fwww.hkepc.com" style="border: none;"></iframe></div></div></div>

<div id="outer_wrap">

<div id="append_parent"><div id="e_cmd_smilies_menu" class="smilieslist" style="display: none;"><div id="smiliesdiv" style="overflow: hidden;"><div class="smiliesgroup"><ul><li><a href="javascript:;" hidefocus="true" class="current" id="e_cmd_stype_1" onclick="smilies_switch('smiliesdiv', '8', 1, 1, 'e_cmd_');if(CURRENTSTYPE) {$('e_cmd_stype_'+CURRENTSTYPE).className='';}this.className='current';CURRENTSTYPE=1;doane(event);">默認表情</a></li></ul></div><div id="smiliesdiv_data"><table id="smiliesdiv_table" cellpadding="0" cellspacing="0"><tbody><tr><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 50)" onclick="insertSmiley(157)" id="e_cmd_smilie_157_td"><img id="smilie_157" width="20" height="6" src="images/smilies/default/icon_band.gif" alt=":band:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 50)" onclick="insertSmiley(158)" id="e_cmd_smilie_158_td"><img id="smilie_158" width="20" height="7" src="images/smilies/default/icon_happybday.gif" alt=":happybday:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 50)" onclick="insertSmiley(159)" id="e_cmd_smilie_159_td"><img id="smilie_159" width="20" height="14" src="images/smilies/default/icon_goodjob.gif" alt=":goodjob:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(160)" id="e_cmd_smilie_160_td"><img id="smilie_160" width="20" height="20" src="images/smilies/default/titter.gif" alt=":titter:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 38)" onclick="insertSmiley(161)" id="e_cmd_smilie_161_td"><img id="smilie_161" width="20" height="13" src="images/smilies/default/icon_sleep.gif" alt=":sleep:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(163)" id="e_cmd_smilie_163_td"><img id="smilie_163" width="19" height="20" src="images/smilies/default/icon_baby.gif" alt=":baby:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 50)" onclick="insertSmiley(164)" id="e_cmd_smilie_164_td"><img id="smilie_164" width="20" height="7" src="images/smilies/default/icon_crutch.gif" alt=":crutch:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 23)" onclick="insertSmiley(165)" id="e_cmd_smilie_165_td"><img id="smilie_165" width="19" height="20" src="images/smilies/default/icon_nono.gif" alt=":nono:"></td></tr><tr><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 50)" onclick="insertSmiley(166)" id="e_cmd_smilie_166_td"><img id="smilie_166" width="20" height="11" src="images/smilies/default/icon_discuss.gif" alt=":discuss:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 45)" onclick="insertSmiley(167)" id="e_cmd_smilie_167_td"><img id="smilie_167" width="20" height="18" src="images/smilies/default/icon_chair.gif" alt=":chair:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 40)" onclick="insertSmiley(12)" id="e_cmd_smilie_12_td"><img id="smilie_12" width="20" height="9" src="images/smilies/default/icon_cry.gif" alt=":cry:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 40)" onclick="insertSmiley(80)" id="e_cmd_smilie_80_td"><img id="smilie_80" width="20" height="14" src="images/smilies/default/icon_fight.gif" alt=":fight:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 28)" onclick="insertSmiley(81)" id="e_cmd_smilie_81_td"><img id="smilie_81" width="20" height="18" src="images/smilies/default/icon_angry2.gif" alt=":angry:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 28)" onclick="insertSmiley(82)" id="e_cmd_smilie_82_td"><img id="smilie_82" width="20" height="17" src="images/smilies/default/icon_kicking.gif" alt=":kicking:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 26)" onclick="insertSmiley(84)" id="e_cmd_smilie_84_td"><img id="smilie_84" width="20" height="14" src="images/smilies/default/icon_crybye.gif" alt=":crybye:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 50)" onclick="insertSmiley(86)" id="e_cmd_smilie_86_td"><img id="smilie_86" width="20" height="14" src="images/smilies/default/icon_cheers2.gif" alt=":cheers:"></td></tr><tr><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(87)" id="e_cmd_smilie_87_td"><img id="smilie_87" width="20" height="20" src="images/smilies/default/noway.gif" alt=":noway:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 19)" onclick="insertSmiley(88)" id="e_cmd_smilie_88_td"><img id="smilie_88" width="19" height="19" src="images/smilies/default/icon22.gif" alt=":redface:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 19)" onclick="insertSmiley(89)" id="e_cmd_smilie_89_td"><img id="smilie_89" width="19" height="19" src="images/smilies/default/icon77.gif" alt=":xd:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(90)" id="e_cmd_smilie_90_td"><img id="smilie_90" width="20" height="20" src="images/smilies/default/VsX4_shifty_P31Twc0M1TeT.gif" alt=":shifty:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(91)" id="e_cmd_smilie_91_td"><img id="smilie_91" width="20" height="20" src="images/smilies/default/loveliness.gif" alt=":loveliness:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(94)" id="e_cmd_smilie_94_td"><img id="smilie_94" width="20" height="20" src="images/smilies/default/smile_27.gif" alt=":faint:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 30)" onclick="insertSmiley(93)" id="e_cmd_smilie_93_td"><img id="smilie_93" width="20" height="15" src="images/smilies/default/smile_38.gif" alt=":ar:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 24)" onclick="insertSmiley(95)" id="e_cmd_smilie_95_td"><img id="smilie_95" width="20" height="20" src="images/smilies/default/smile_44.gif" alt=":silent:"></td></tr><tr><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(137)" id="e_cmd_smilie_137_td"><img id="smilie_137" width="20" height="20" src="images/smilies/default/dizzy.gif" alt=":dizzy:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(138)" id="e_cmd_smilie_138_td"><img id="smilie_138" width="20" height="20" src="images/smilies/default/shutup.gif" alt=":shutup:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 27)" onclick="insertSmiley(79)" id="e_cmd_smilie_79_td"><img id="smilie_79" width="20" height="16" src="images/smilies/default/icon_photo.gif" alt=":photo:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 50)" onclick="insertSmiley(78)" id="e_cmd_smilie_78_td"><img id="smilie_78" width="20" height="8" src="images/smilies/default/icon_gun2.gif" alt=":gun:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 28)" onclick="insertSmiley(77)" id="e_cmd_smilie_77_td"><img id="smilie_77" width="20" height="15" src="images/smilies/default/icon_giveup.gif" alt=":giveup:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 18)" onclick="insertSmiley(11)" id="e_cmd_smilie_11_td"><img id="smilie_11" width="18" height="18" src="images/smilies/default/icon_mad.gif" alt=":mad:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 35)" onclick="insertSmiley(10)" id="e_cmd_smilie_10_td"><img id="smilie_10" width="20" height="15" src="images/smilies/default/icon_help.gif" alt=":help:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 18)" onclick="insertSmiley(9)" id="e_cmd_smilie_9_td"><img id="smilie_9" width="15" height="20" src="images/smilies/default/icon_confused.gif" alt=":?:"></td></tr><tr><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 18)" onclick="insertSmiley(8)" id="e_cmd_smilie_8_td"><img id="smilie_8" width="18" height="18" src="images/smilies/default/icon_eek.gif" alt=":eek:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(7)" id="e_cmd_smilie_7_td"><img id="smilie_7" width="20" height="20" src="images/smilies/default/icon_tongue.gif" alt=":p:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 25)" onclick="insertSmiley(6)" id="e_cmd_smilie_6_td"><img id="smilie_6" width="20" height="19" src="images/smilies/default/icon_dev.gif" alt=":dev:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 29)" onclick="insertSmiley(5)" id="e_cmd_smilie_5_td"><img id="smilie_5" width="20" height="14" src="images/smilies/default/icon_good.gif" alt=":good:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 18)" onclick="insertSmiley(3)" id="e_cmd_smilie_3_td"><img id="smilie_3" width="18" height="18" src="images/smilies/default/icon_biggrin.gif" alt=":d:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 33)" onclick="insertSmiley(2)" id="e_cmd_smilie_2_td"><img id="smilie_2" width="20" height="16" src="images/smilies/default/icon_adore.gif" alt=":adore:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 18)" onclick="insertSmiley(1)" id="e_cmd_smilie_1_td"><img id="smilie_1" width="18" height="18" src="images/smilies/default/icon_haha.gif" alt=":haha:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 28)" onclick="insertSmiley(18)" id="e_cmd_smilie_18_td"><img id="smilie_18" width="19" height="20" src="images/smilies/default/icon_clap.gif" alt=":wahaha:"></td></tr><tr><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 18)" onclick="insertSmiley(17)" id="e_cmd_smilie_17_td"><img id="smilie_17" width="15" height="20" src="images/smilies/default/icon_drool.gif" alt=":drool:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 18)" onclick="insertSmiley(16)" id="e_cmd_smilie_16_td"><img id="smilie_16" width="18" height="18" src="images/smilies/default/icon_kiss.gif" alt=":kiss:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 46)" onclick="insertSmiley(14)" id="e_cmd_smilie_14_td"><img id="smilie_14" width="20" height="9" src="images/smilies/default/icon_smoke.gif" alt=":smoke:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 33)" onclick="insertSmiley(74)" id="e_cmd_smilie_74_td"><img id="smilie_74" width="20" height="19" src="images/smilies/default/icon_agree.gif" alt=":agree:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 30)" onclick="insertSmiley(75)" id="e_cmd_smilie_75_td"><img id="smilie_75" width="20" height="16" src="images/smilies/default/icon_hitwall.gif" alt=":hitwall:"></td><td onmouseover="smilies_preview('e_cmd_', 'smiliesdiv', this, 20)" onclick="insertSmiley(76)" id="e_cmd_smilie_76_td"><img id="smilie_76" width="20" height="20" src="images/smilies/default/icon_naughty.gif" alt=":naug:"></td></tr></tbody></table></div><div class="smilieslist_page" id="smiliesdiv_page"></div></div></div><div id="typeid_ctrl_menu" class="select_menu" style="width: 94px; position: absolute; z-index: 301; opacity: 1; left: 755.852px; top: 288.438px; display: none;"><ul><li class="current">分類</li><li class="">開箱</li><li>教學</li><li>測試</li><li>操作疑難</li><li class="">保養相關</li><li>產品資訊</li><li>中央處理器</li><li>記憶體</li><li>主機板</li><li>電源器</li><li>電腦組合</li><li>其他</li></ul></div></div><div id="ajaxwaitid"></div>

<div id="header">
<div id="headR1" class="clearfix">
<div class="updates hidden"><span class="caption">最新熱點：</span></div>
<ul class="utilities">
<li class="lang" title="繁簡轉換"><a href="/lang"><img src="images/default/language.png" alt=""> 簡體版</a></li>
<li><a href="/feed" title="聚合訂閱"><img src="images/default/feed.png" alt=""> 訂閱頻道</a></li>
<li class="hidden" id="subscription"><input class="hidden" type="text" maxlength="100"><a href="#" title="電郵訂閱"><img src="images/default/mail.png" alt=""> 訂閱電子報</a></li>
<li id="facebook"><a href="http://facebook.hkepc.com"><img src="images/default/facebook.png" alt="Facebook"><span>Facebook</span></a></li>
</ul>
</div>
<div class="wrap s_clear">
<h2><a href="http://www.hkepc.com/" title="電腦領域 HKEPC Hardware "><img src="images/hkepc2/logo.png" alt="電腦領域 HKEPC Hardware " border="0"></a></h2>

<div id="ad_headerbanner"><iframe id="af3d16f6" name="af3d16f6" src="http://abc.hkepc.com/www/d/dafr.php?zoneid=1&amp;FH=91&amp;FW=700&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;ct0=INSERT_CLICKURL_HERE" frameborder="0" scrolling="no" width="700" height="91">&lt;a href='http://abc.hkepc.com/www/d/ck.php?n=ab10fdfc&amp;amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'&gt;&lt;img src='http://abc.hkepc.com/www/d/avw.php?zoneid=1&amp;amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;amp;n=ab10fdfc&amp;amp;ct0=INSERT_CLICKURL_HERE' border='0' alt='' /&gt;&lt;/a&gt;</iframe></div>
<div id="menu">
<ul>
<li class="menu_8"><a href="http://www.hkepc.com/" hidefocus="true" id="mn_www">主頁</a></li><li class="menu_9"><a href="http://www.hkepc.com/coverStory" hidefocus="true" id="mn_coverStory">專題報導</a></li><li class="menu_10"><a href="http://www.hkepc.com/news" hidefocus="true" id="mn_news">新聞中心</a></li><li class="menu_11"><a href="http://www.hkepc.com/review" hidefocus="true" id="mn_review">新品快遞</a></li><li class="menu_12"><a href="http://www.hkepc.com/price" hidefocus="true" id="mn_price">賣場報價</a></li><li class="menu_13"><a href="http://www.hkepc.com/member" hidefocus="true" id="mn_member">會員消息</a></li><li class="current"><a href="index.php" hidefocus="true" id="mn_index">討論區</a></li><li class="menu_2"><a href="search.php" hidefocus="true" id="mn_search">搜索</a></li><li class="menu_6"><a href="my.php?item=threads" hidefocus="true" id="mn_my_1">我的文章</a></li><li class="menu_5"><a href="misc.php?action=nav" hidefocus="true" onclick="showWindow('nav', this.href);return false;">導航</a></li><li class="menu_4"><a href="faq.php" hidefocus="true" id="mn_faq">說明</a></li>
<li class="yahoosearch">
<script type="text/javascript">
function getIP()
{	if(window.XDomainRequest) {xmlhttp = new XDomainRequest();} else if (window.XMLHttpRequest) {xmlhttp = new XMLHttpRequest(); } else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
xmlhttp.open("GET","http://api.hostip.info/get_html.php",false); xmlhttp.send();hostipInfo = xmlhttp.responseText.split("\n");var IP=false;
for (i=0; hostipInfo.length >= i; i++) {if(hostipInfo[i]){ipAddress = hostipInfo[i].split(": "); if ( ipAddress[0] == "IP" ) {IP = ipAddress[1];}}}return IP;}
</script>
<form method="post" action="/forum/search.php">
<input type="hidden" name="formhash" value="1c56d8cd">
<input type="hidden" name="srchtype" value="title">
<script type="text/javascript">document.write('<input name="srchtxt" value="'+decodeURIComponent("")+'">')</script><input name="srchtxt" value="">
<button type="submit" name="searchsubmit" id="searchsubmit" value="true" prompt="search_submit">搜索</button>
</form>
</li>

</ul>
<script type="text/javascript">
var currentMenu = $('mn_') ? $('mn_') : $('mn_index');
currentMenu.parentNode.className = 'current';
</script>
</div>

<div id="umenu">
<cite><a href="space.php?uid=143676" class="noborder">hihihi123hk</a></cite>
<span class="pipe">|</span>
<a id="myprompt" href="notice.php">提醒</a>
<span id="myprompt_check"></span>
<a href="pm.php" id="pm_ntc" target="_blank">短消息</a>

<span class="pipe">|</span>
<a href="memcp.php">個人中心</a>
<a href="logging.php?action=logout&amp;formhash=1c56d8cd">退出</a>
</div>
</div>
<div id="myprompt_menu" style="display:none" class="promptmenu">
<div class="promptcontent">
<ul class="s_clear"><li style="display:none"><a id="prompt_pm" href="pm.php?filter=newpm" target="_blank">私人消息 (0)</a></li><li style="display:none"><a id="prompt_announcepm" href="pm.php?filter=announcepm" target="_blank">公共消息 (0)</a></li><li style="display:none"><a id="prompt_systempm" href="notice.php?filter=systempm" target="_blank">系統消息 (0)</a></li><li style="display:none"><a id="prompt_friend" href="notice.php?filter=friend" target="_blank">好友消息 (0)</a></li><li style="display:none"><a id="prompt_threads" href="notice.php?filter=threads" target="_blank">帖子消息 (0)</a></li></ul>
</div>
</div>
</div>

<div id="nav"><a href="index.php">電腦領域 HKEPC Hardware </a> » <a href="forumdisplay.php?fid=61">系統組件</a>  » 發新話題</div><div id="wrap" class="wrap s_clear"><div class="main"><div class="content editorcontent">
<form method="post" id="postform" action="post.php?action=newthread&amp;fid=61&amp;extra=&amp;topicsubmit=yes" onsubmit="return validate(this)">
<input type="hidden" name="formhash" id="formhash" value="1c56d8cd">
<input type="hidden" name="posttime" id="posttime" value="1454732291">
<input type="hidden" name="wysiwyg" id="e_mode" value="0">
<input type="hidden" name="iconid" id="iconid" value="">
<div class="s_clear" id="editorbox">
<h3 class="float_ctrl">
<em id="returnmessage">
發新話題</em>
<span><a href="faq.php?action=credits&amp;fid=61" target="_blank" title="積分說明">發帖後您的&nbsp;EPC Dollar +1  &nbsp;</a></span>
</h3>
<div class="postbox" id="postbox">
<div class="float_postinfo s_clear">
<em id="icon" class="dropmenu" onclick="showMenu({'ctrlid':this.id})"><img id="icon_img" src="images/icons/icon1.gif"></em>
<ul id="icon_menu" class="popupmenu_popup" style="display:none"><li><a href="javascript:;"><img onclick="switchicon(140, this)" src="images/icons/icon10.gif" alt=""></a></li><li><a href="javascript:;"><img onclick="switchicon(141, this)" src="images/icons/icon11.gif" alt=""></a></li><li><a href="javascript:;"><img onclick="switchicon(142, this)" src="images/icons/icon12.gif" alt=""></a></li><li><a href="javascript:;"><img onclick="switchicon(143, this)" src="images/icons/icon13.gif" alt=""></a></li><li><a href="javascript:;"><img onclick="switchicon(144, this)" src="images/icons/icon14.gif" alt=""></a></li><li><a href="javascript:;"><img onclick="switchicon(145, this)" src="images/icons/icon15.gif" alt=""></a></li><li><a href="javascript:;"><img onclick="switchicon(146, this)" src="images/icons/icon16.gif" alt=""></a></li></ul>
<span><input name="subject" id="subject" prompt="post_subject" class="txt" value="" tabindex="1"></span>
<div class="left">
<div class="float_typeid">
<select name="typeid" id="typeid" selecti="0" style="display: none;">
<option value="0"></option></select><a href="javascript:;" hidefocus="true" id="typeid_ctrl" tabindex="1">分類</a>
</div>
</div>
</div>
<div id="e_controls" class="editorrow">
<div class="editor">
<a id="e_switcher" class="plugeditor editormode"><input type="checkbox" name="checkbox" value="0" checked="checked" onclick="switchEditor(this.checked?0:1)">源碼</a>
<div class="editorbtn">
<div class="maxbtn" style="display: none;">
<a id="e_cmd_paste" title="粘貼" href="javascript:;">粘貼</a>
</div>
<div class="minibtn">
<p>
<a id="e_cmd_simple" title="粗體" href="javascript:;">B</a>
<a id="e_cmd_fontname" title="字體" href="javascript:;">Font</a>
<a id="e_cmd_fontsize" title="大小" href="javascript:;">Size</a>
<a id="e_cmd_forecolor" title="顏色" href="javascript:;">Color</a>
<a id="e_cmd_createlink" title="插入鏈接" href="javascript:;">Url</a>
<em></em>
<a id="e_cmd_unlink" title="移除鏈接" href="javascript:;">Unlink</a>
<a id="e_cmd_removeformat" title="清除文本格式" href="javascript:;">Removeformat</a>
<a id="e_cmd_undo" title="撤銷" href="javascript:;">Undo</a>
<a id="e_cmd_redo" title="重做" href="javascript:;">Redo</a>
</p>
<p>
<a id="e_cmd_paragraph" title="段落" href="javascript:;">P</a>
<a id="e_cmd_table" title="插入表格" class="tblbtn_disabled" href="javascript:;">Table</a>
<a id="e_cmd_list" title="插入列表" href="javascript:;">List</a>
<a id="e_cmd_hidden" title="插入隱藏內容" class="hidebtn_disabled" href="javascript:;">Hide</a>
<a id="e_cmd_free" title="插入免費信息" href="javascript:;">Free</a>
<em></em>
<a id="e_cmd_savedata" title="保存數據" href="javascript:;">Savedata</a>
<a id="e_cmd_loaddata" title="恢複數據" href="javascript:;">Loaddata</a>
<a id="e_cmd_clearcontent" title="清空內容" href="javascript:;">Clearcontent</a>
<a id="e_cmd_checklength" title="字數檢查" href="javascript:;">Checklength</a>
</p>
</div>
<div class="maxbtn">
<a id="e_cmd_smilies" title="表情" href="javascript:;">表情</a>
<div id="e_cmd_image_notice" class="haspic" style="display:none">!</div>
<a id="e_cmd_image" title="圖片" href="javascript:;">圖片</a>
<div id="e_cmd_attach_notice" class="hasatt" style="display:none">!</div>
<a id="e_cmd_attach" title="附件" href="javascript:;">附件</a>
<a id="e_cmd_code" title="代碼" href="javascript:;">代碼</a>
<a id="e_cmd_quote" title="引用" href="javascript:;">引用</a>
</div>
<div class="minibtn">
<p><a id="e_cmd_custom1_fly" class="customedit" title="Make text move horizontal, the same effect as html tag <marquee>. NOTE: Only Internet Explorer supports this feature" href="javascript:;"><img src="images/common/bb_fly.gif" title="Make text move horizontal, the same effect as html tag <marquee>. NOTE: Only Internet Explorer supports this feature" alt="fly"></a><a id="e_cmd_custom1_rm" class="customedit" title="Embed Real Movie in thread page" href="javascript:;"><img src="images/common/bb_rm.gif" title="Embed Real Movie in thread page" alt="rm"></a></p>
<p><a id="e_cmd_custom1_wmv" class="customedit" title="Embed Windows media file in thread page" href="javascript:;"><img src="images/common/bb_wmv.gif" title="Embed Windows media file in thread page" alt="wmv"></a><a id="e_cmd_custom1_qq" class="customedit" title="Show online status of specified QQ UIN and chat with him/her simply by clicking the icon" href="javascript:;"><img src="images/common/bb_qq.gif" title="Show online status of specified QQ UIN and chat with him/her simply by clicking the icon" alt="qq"></a></p>
</div>
</div>
</div>
</div>

<div class="newediter">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed">
<tbody><tr><td><textarea class="autosave" name="message" id="e_textarea" prompt="post_message" tabindex="1" style="height:300px"></textarea></td></tr>
</tbody></table>
</div>

<script src="forumdata/cache/post.js?RO9" type="text/javascript"></script>
<script src="forumdata/cache/bbcode.js?RO9" type="text/javascript"></script>
<script type="text/javascript">

var editorid = 'e';
var textobj = $(editorid + '_textarea');
var wysiwyg = (BROWSER.ie || BROWSER.firefox || (BROWSER.opera >= 9)) && parseInt('0') == 1 ? 1 : 0;
var allowswitcheditor = parseInt('1');
var allowhtml = parseInt('0');
var forumallowhtml = parseInt('0');
var allowsmilies = parseInt('1');
var allowbbcode = parseInt('1');
var allowimgcode = parseInt('1');
var allowpostattach = parseInt('1');
var allowpostimg = parseInt('1');
var editorcss = 'forumdata/cache/style_28_wysiwyg.css?RO9';
var TABLEBG = '#FFF';
var pid = parseInt('');
var extensions = 'jpg, png, gif';
var imgexts = 'jpg, gif, png';
var fontoptions = new Array("仿宋_GB2312", "黑體", "標楷體", "細明體", "新細明體", "微軟雅黑", "Trebuchet MS", "Tahoma", "Arial", "Impact", "Verdana", "Times New Roman");
var custombbcodes = new Array();
custombbcodes["fly"] = {'prompt' : '請輸入滾動顯示的文字:'};custombbcodes["wmv"] = {'prompt' : '請輸入 Windows media 音頻或視頻的 URL:'};custombbcodes["rm"] = {'prompt' : '請輸入 Real 音頻或視頻的 URL:'};custombbcodes["qq"] = {'prompt' : '請輸入顯示在線狀態 QQ 號碼:'};</script><div class="columntype">
<table cellpadding="0" cellspacing="0"><tbody><tr>
</tr></tbody></table>
</div>
<div class="columntype">
<h4>發帖選項:</h4>
<table cellpadding="0" cellspacing="0" border="0">
<tbody><tr>
<td class="firstlist">
<p><input type="checkbox" name="htmlon" id="htmlon" value="0" disabled="disabled"><label for="htmlon">Html 代碼</label></p>
<p><input type="checkbox" id="allowimgcode" disabled="" checked="checked"><label for="allowimgcode">[img] 代碼</label></p>
</td>
<td>
<p><input type="checkbox" name="parseurloff" id="parseurloff" value="1" tabindex="1"><label for="parseurloff">禁用 URL 識別</label></p>
<p><input type="checkbox" name="smileyoff" id="smileyoff" value="1" tabindex="1"><label for="smileyoff">禁用 <a href="faq.php?action=faq&amp;id=5&amp;messageid=32" target="_blank">Smilies</a></label></p>
<p><input type="checkbox" name="bbcodeoff" id="bbcodeoff" value="1" tabindex="1"><label for="bbcodeoff">禁用 <a href="faq.php?action=faq&amp;id=5&amp;messageid=18" target="_blank">Discuz!代碼</a></label></p>
</td>
<td>
<input type="hidden" name="ordertype" id="ordertype" value="" tabindex="1">
<p><input type="checkbox" name="attention_add" id="attention_add" checked="checked" value="1"><label for="attention_add">關注此主題的新回覆</label></p>
<p><input type="checkbox" name="usesig" id="usesig" value="1" disabled="" tabindex="1"><label for="usesig">使用個人簽名</label></p>
</td>
<td>
</td>
</tr>
</tbody></table><br>
</div>
<div class="btnbar">
<span>
</span>
<button type="submit" id="postsubmit" prompt="post_submit" value="true" name="topicsubmit" tabindex="1">
發新話題
</button>
</div>
</div>
</div>
</form>

</div></div></div>

<div id="e_menus" class="editorrow" style="overflow: hidden; margin-top: -5px; height: 0; border: none; background: transparent;"><div class="editortoolbar">
<div class="popupmenu_popup simple_menu" id="e_cmd_simple_menu" style="display: none">
<ul unselectable="on">
<li id="e_cmd_bold" onclick="discuzcode('bold')" unselectable="on">粗體</li>
<li id="e_cmd_italic" onclick="discuzcode('italic')" unselectable="on">斜體</li>
<li id="e_cmd_underline" onclick="discuzcode('underline')" unselectable="on">下劃線</li>
<li id="e_cmd_strikethrough" onclick="discuzcode('strikethrough')" unselectable="on">刪除線</li>
<li id="e_cmd_inserthorizontalrule" onclick="discuzcode('inserthorizontalrule')" unselectable="on">分隔線</li>
</ul>
</div><div class="popupmenu_popup fontname_menu" id="e_cmd_fontname_menu" style="display: none">
<ul unselectable="on"><li onclick="discuzcode('fontname', '仿宋_GB2312')" style="font-family: 仿宋_GB2312" unselectable="on">仿宋_GB2312</li><li onclick="discuzcode('fontname', '黑體')" style="font-family: 黑體" unselectable="on">黑體</li><li onclick="discuzcode('fontname', '標楷體')" style="font-family: 標楷體" unselectable="on">標楷體</li><li onclick="discuzcode('fontname', '細明體')" style="font-family: 細明體" unselectable="on">細明體</li><li onclick="discuzcode('fontname', '新細明體')" style="font-family: 新細明體" unselectable="on">新細明體</li><li onclick="discuzcode('fontname', '微軟雅黑')" style="font-family: 微軟雅黑" unselectable="on">微軟雅黑</li><li onclick="discuzcode('fontname', 'Trebuchet MS')" style="font-family: Trebuchet MS" unselectable="on">Trebuchet MS</li><li onclick="discuzcode('fontname', 'Tahoma')" style="font-family: Tahoma" unselectable="on">Tahoma</li><li onclick="discuzcode('fontname', 'Arial')" style="font-family: Arial" unselectable="on">Arial</li><li onclick="discuzcode('fontname', 'Impact')" style="font-family: Impact" unselectable="on">Impact</li><li onclick="discuzcode('fontname', 'Verdana')" style="font-family: Verdana" unselectable="on">Verdana</li><li onclick="discuzcode('fontname', 'Times New Roman')" style="font-family: Times New Roman" unselectable="on">Times New Roman</li></ul>
</div><div class="popupmenu_popup fontsize_menu" id="e_cmd_fontsize_menu" style="display: none">
<ul unselectable="on"><li onclick="discuzcode('fontsize', 1)" unselectable="on"><font size="1" unselectable="on">1</font></li><li onclick="discuzcode('fontsize', 2)" unselectable="on"><font size="2" unselectable="on">2</font></li><li onclick="discuzcode('fontsize', 3)" unselectable="on"><font size="3" unselectable="on">3</font></li><li onclick="discuzcode('fontsize', 4)" unselectable="on"><font size="4" unselectable="on">4</font></li><li onclick="discuzcode('fontsize', 5)" unselectable="on"><font size="5" unselectable="on">5</font></li><li onclick="discuzcode('fontsize', 6)" unselectable="on"><font size="6" unselectable="on">6</font></li><li onclick="discuzcode('fontsize', 7)" unselectable="on"><font size="7" unselectable="on">7</font></li></ul>
</div>

<div class="popupmenu_popup simple_menu" id="e_cmd_paragraph_menu" style="display: none">
<ul unselectable="on">
<li><a id="e_cmd_justifycenter" onclick="discuzcode('justifycenter')" unselectable="on">居中</a></li>
<li><a id="e_cmd_justifyleft" onclick="discuzcode('justifyleft')" unselectable="on">居左</a></li>
<li><a id="e_cmd_justifyright" onclick="discuzcode('justifyright')" unselectable="on">居右</a></li>
<li><a id="e_cmd_autotypeset" onclick="discuzcode('autotypeset')" unselectable="on">自動排版</a></li>
</ul>
</div>

<div class="popupmenu_popup simple_menu" id="e_cmd_list_menu" style="display: none">
<ul unselectable="on">
<li id="e_cmd_insertorderedlist" onclick="discuzcode('insertorderedlist')" unselectable="on">排序的列表</li>
<li id="e_cmd_insertunorderedlist" onclick="discuzcode('insertunorderedlist')" unselectable="on">未排序列表</li>
</ul>
</div>

</div><div class="popupmenu_popup uploadfile" id="e_cmd_image_menu" style="display: none" unselectable="on">
<div class="float_ctrl"><span><a href="javascript:;" class="float_close" onclick="hideMenu()">關閉</a></span></div>
<ul class="imguptype" id="e_cmd_image_ctrl">
<li><a href="javascript:;" hidefocus="true" class="" id="e_btn_www" onclick="switchImagebutton('www');">網絡圖片</a></li>
<li><a href="javascript:;" hidefocus="true" id="e_btn_imgattachlist" onclick="switchImagebutton('imgattachlist');" class="">圖片列表</a></li>
<li><a href="javascript:;" hidefocus="true" id="e_btn_local" onclick="switchImagebutton('local');" class="">普通上傳</a></li><li><a href="javascript:;" hidefocus="true" id="e_btn_multi" onclick="switchImagebutton('multi');" class="current">批量上傳</a></li></ul>
<div class="popupmenu_option" unselectable="on" id="e_www" style="display: none;">
<table cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<th width="74%">請輸入圖片地址</th>
<th width="13%">寬(可選)</th>
<th width="13%">高(可選)</th>
</tr>
<tr>
<td><input type="text" id="e_cmd_image_param_1" style="width: 95%;" value="" class="txt"></td>
<td><input id="e_cmd_image_param_2" size="5" value="" class="txt"></td>
<td><input id="e_cmd_image_param_3" size="5" value="" class="txt"></td>
</tr>
<tr>
<td colspan="3" align="center"><input type="button" id="e_cmd_image_submit" value="提交"> &nbsp; <input onclick="hideMenu();" value="取消" type="button"></td>
</tr>
</tbody></table>
</div>
<div class="popupmenu_option" unselectable="on" id="e_local" style="display: none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%">
<tbody id="imgattachbodyhidden" style="display:none"><tr>
<td class="attachnum"><span id="imglocalno[]"><img src="images/attachicons/common_new.gif"></span></td>
<td class="attachname">
<span id="imgdeschidden[]" style="display:none">
<span id="imglocalfile[]"></span>
</span>
<input type="hidden" name="imglocalid[]">
</td>
<td class="attachdel"><span id="imgcpdel[]"></span></td>
</tr></tbody>
</table>
<div class="post_tablelist"><table cellpadding="0" cellspacing="0" summary="post_attachbody" border="0" width="100%"><tbody id="imgattachbody"><tr style="display: none;">
<td class="attachnum"><span id="imglocalno_2"><img src="images/attachicons/common_new.gif"></span></td>
<td class="attachname">
<span id="imgdeschidden_2" style="display:none">
<span id="imglocalfile_2"></span>
</span>
<input type="hidden" name="imglocalid[]" value="2">
</td>
<td class="attachdel"><span id="imgcpdel_2"></span></td>
</tr></tbody></table></div>
<div class="uploadblock">
<div id="imgattachbtnhidden" style="display:none"><span><form name="imgattachform" id="imgattachform" method="post" action="misc.php?action=swfupload&amp;operation=upload&amp;simple=1&amp;type=image" target="attachframe" enctype="multipart/form-data"><input type="hidden" name="uid" value="143676"><input type="hidden" name="hash" value="7a4a04edc96067996b207219ebcd8fce"><input type="file" name="Filedata" size="45" class="filedata"></form></span></div>
<div id="imgattachbtn"><span><form name="imgattachform_2" id="imgattachform_2" method="post" action="misc.php?action=swfupload&amp;operation=upload&amp;simple=1&amp;type=image" target="attachframe" enctype="multipart/form-data"><input type="hidden" name="uid" value="143676"><input type="hidden" name="hash" value="7a4a04edc96067996b207219ebcd8fce"><input type="file" name="Filedata" size="45" class="filedata" id="imgattachnew_2"></form></span></div>
<p id="imguploadbtn"><input type="button" value="上傳" onclick="uploadAttach(0, 0, 'img')"> &nbsp; <input type="button" value="取消" onclick="hideMenu();"></p>
<p id="imguploading" style="display: none;"><img src="images/default/uploading.gif" style="vertical-align: middle;"> 上傳中，請稍候，您可以<a href="javascript:;" onclick="hideMenu()">暫時關閉這個小窗口</a>，上傳完成後您會收到通知。</p>
</div>
<div class="notice uploadinfo">
文件尺寸: <strong>小於 150KB </strong>&nbsp;
<br>可用擴展名: <strong>jpg, gif, png</strong>&nbsp;
</div>
</div>
<div class="popupmenu_option" unselectable="on" id="e_multi">
<div class="floatboxswf" id="e_multiimg"><embed width="470" height="268" src="images/common/upload.swf?site=http://www.hkepc.com/forum/misc.php%3Ftype=image&amp;type=image" quality="high" menu="false" allowscriptaccess="always" wmode="transparent" type="application/x-shockwave-flash">
</div>
<div class="notice uploadinfo">
文件尺寸: <strong>小於 150KB </strong>&nbsp;
<br>可用擴展名: <strong>jpg, gif, png</strong>&nbsp;
</div>
</div>
<div class="popupmenu_option" unselectable="on" id="e_imgattachlist" style="display: none;">
<div class="upfilelist">
<div id="imgattachlist">
<p class="notice">本帖還沒有圖片附件, <a href="javascript:;" onclick="switchImagebutton('multi');">點擊這裡</a>上傳</p>
</div>
<div id="unusedimgattachlist">
</div>
</div>
<p class="notice" id="imgattach_notice" style="display: none">點擊圖片插入到帖子內容中</p>
</div>
</div>

<div class="popupmenu_popup uploadfile" id="e_cmd_attach_menu" style="display: none" unselectable="on">
<div class="float_ctrl"><span><a href="javascript:;" class="float_close" onclick="hideMenu()">關閉</a></span></div>
<ul class="imguptype" id="e_cmd_attach_ctrl">
<li><a href="javascript:;" hidefocus="true" class="" id="e_btn_attachlist" onclick="switchAttachbutton('attachlist');">附件列表</a></li>
<li><a href="javascript:;" hidefocus="true" id="e_btn_upload" onclick="switchAttachbutton('upload');" class="">普通上傳</a></li><li><a href="javascript:;" hidefocus="true" id="e_btn_swfupload" onclick="switchAttachbutton('swfupload');" class="current">批量上傳</a></li></ul>
<div class="popupmenu_option" unselectable="on" id="e_upload" style="display: none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%">
<tbody id="attachbodyhidden" style="display:none"><tr>
<td class="attachnum"><span id="localno[]"><img src="images/attachicons/common_new.gif"></span></td>
<td class="attachname">
<span id="deschidden[]" style="display:none">
<span id="localfile[]"></span>
</span>
<input type="hidden" name="localid[]">
</td>
<td class="attachdel"><span id="cpdel[]"></span></td>
</tr></tbody>
</table>
<div class="post_tablelist"><table cellpadding="0" cellspacing="0" summary="post_attachbody" border="0" width="100%"><tbody id="attachbody"><tr style="display: none;">
<td class="attachnum"><span id="localno_1"><img src="images/attachicons/common_new.gif"></span></td>
<td class="attachname">
<span id="deschidden_1" style="display:none">
<span id="localfile_1"></span>
</span>
<input type="hidden" name="localid[]" value="1">
</td>
<td class="attachdel"><span id="cpdel_1"></span></td>
</tr></tbody></table></div>
<div class="uploadblock">
<div id="attachbtnhidden" style="display:none"><span><form name="attachform" id="attachform" method="post" action="misc.php?action=swfupload&amp;operation=upload&amp;simple=1" target="attachframe" enctype="multipart/form-data"><input type="hidden" name="uid" value="143676"><input type="hidden" name="hash" value="7a4a04edc96067996b207219ebcd8fce"><input type="file" name="Filedata" size="45" class="filedata"></form></span></div>
<div id="attachbtn"><span><form name="attachform_1" id="attachform_1" method="post" action="misc.php?action=swfupload&amp;operation=upload&amp;simple=1" target="attachframe" enctype="multipart/form-data"><input type="hidden" name="uid" value="143676"><input type="hidden" name="hash" value="7a4a04edc96067996b207219ebcd8fce"><input type="file" name="Filedata" size="45" class="filedata" id="attachnew_1"></form></span></div>
<p id="uploadbtn"><input type="button" value="上傳" onclick="uploadAttach(0, 0)"> &nbsp; <input type="button" value="取消" onclick="hideMenu();"></p>
<p id="uploading" style="display: none;"><img src="images/default/uploading.gif" style="vertical-align: middle;"> 上傳中，請稍候，您可以<a href="javascript:;" onclick="hideMenu()">暫時關閉這個小窗口</a>，上傳完成後您會收到通知。</p>
</div>
<div class="notice uploadinfo">
文件尺寸: <strong>小於 150KB </strong>&nbsp;
<br>可用擴展名: <strong>jpg, png, gif</strong>&nbsp;
</div>
<iframe name="attachframe" id="attachframe" style="display: none;" onload="uploadNextAttach();"></iframe>
</div>
<div class="popupmenu_option" unselectable="on" id="e_swfupload">
<div class="floatboxswf" id="e_multiattach"><embed width="470" height="268" src="images/common/upload.swf?site=http://www.hkepc.com/forum/misc.php" quality="high" menu="false" allowscriptaccess="always" wmode="transparent" type="application/x-shockwave-flash">
</div>
<div class="notice uploadinfo">
文件尺寸: <strong>小於 150KB </strong>&nbsp;
<br>可用擴展名: <strong>jpg, png, gif</strong>&nbsp;
</div>
</div>
<div class="popupmenu_option post_tablelist" unselectable="on" id="e_attachlist" style="display: none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" id="attach_tblheader" style="display: none">
<tbody><tr>
<td class="attachnum"></td>
<td class="attachname">文件名</td>
<td class="attachdesc">描述</td>
<td class="attachdel"></td>
</tr>
</tbody></table>
<div class="upfilelist">
<div id="attachlist">
<p class="notice">本帖還沒有附件, <a href="javascript:;" onclick="switchAttachbutton('swfupload');">點擊這裡</a>上傳</p>
</div>
<div id="unusedattachlist">
</div>
</div>
<p class="notice" id="attach_notice" style="display: none">點擊文件名插入到帖子內容中</p>
</div>
</div>

<script src="forumdata/cache/smilies_var.js?RO9" type="text/javascript"></script>
<script type="text/javascript">smilies_show('smiliesdiv', 8, editorid + '_cmd_');</script>
<script type="text/javascript">
if(wysiwyg) {
newEditor(1, bbcode2html(textobj.value));
} else {
newEditor(0, textobj.value);
}

var ATTACHNUM = {'imageused':0,'imageunused':0,'attachused':0,'attachunused':0};
function switchImagebutton(btn) {
var btns = ['www'];
btns.push('imgattachlist');
btns.push('local');btns.push('multi');switchButton(btn, btns);
}
ATTACHNUM['imageused'] = 0;
ATTACHNUM['imageunused'] = 0;
switchImagebutton('multi');
function switchAttachbutton(btn) {
var btns = ['attachlist'];
btns.push('upload');btns.push('swfupload');switchButton(btn, btns);
}
ATTACHNUM['attachused'] = 0;
ATTACHNUM['attachunused'] = 0;
switchAttachbutton('swfupload');
setCaretAtEnd();
if(BROWSER.ie >= 5 || BROWSER.firefox >= 2) {
_attachEvent(window, 'beforeunload', saveData);
}
</script></div>

<script type="text/javascript">

var postminchars = parseInt('6');
var postmaxchars = parseInt('30000');
var disablepostctrl = parseInt('0');
var seccodecheck = parseInt('');
var secqaacheck = parseInt('');
var typerequired = parseInt('1');
var special = parseInt('0');
var isfirstpost = 1;
var allowposttrade = parseInt('');
var allowpostreward = parseInt('');
var allowpostactivity = parseInt('');
var sortid = parseInt('');
var special = parseInt('0');

simulateSelect('typeid');
addAttach();addAttach('img');
</script>
</div><div id="footer_wrap" class="wrap">
<div class="ad_footerbanner" id="ad_footerbanner1"></div>
<div id="footer">
<div class="s_clear">
<div id="footlink">
<p>
<strong><a href="http://www.hkepc.com/" target="_blank">返回主頁</a></strong>
<span class="pipe">|</span><a href="mailto:forum@hkepc.com">聯繫我們</a>

<span class="pipe">|</span><a href="archiver/" target="_blank">Archiver</a></p>
<p class="smalltext">
GMT+8, 2016-2-6 12:18, <span id="debuginfo">Processed in 0.058555 second(s), 5 queries</span>.
                                	</p>
</div>
<div id="rightinfo">
<p>Powered by <strong><a href="http://www.discuz.net" target="_blank">Discuz!</a></strong> <em>7.2</em></p>
<p class="smalltext">© 2001-2009 <a href="http://www.comsenz.com" target="_blank">Comsenz Inc.</a></p>
</div></div>
</div>
</div>
<div id="epc_footer">
<div class="content">
<p>
<a href="/about">關於</a>
|
<a href="/terms">使用條款</a>
|
<a href="/privacy">私隱政策</a>
|
<a href="mailto:marketing@hkepc.com">聯絡我們</a>
|
<a href="mailto:advertisement@hkepc.com">廣告查詢</a>
</p>
<p>Copyright © 2003-2016 HKEPC Production Co. Ltd.</p>
</div>
<div class="shadow"></div>
</div>



<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-2596504-1']);
  _gaq.push(['_setDomainName', '.hkepc.com']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId  : '144908409038422',
      status : false,
      cookie : false,
      xfbml  : true
    });
  };
</script>
<!--[if !IE]><!-->
<script>
  (function() {
    var e = document.createElement('script');
    e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
    e.async = true;
    document.getElementById('fb-root').appendChild(e);
  }());
</script>
<!--<![endif]-->
<!--[if IE 6]>
<script>
  (function() {
    var e = document.createElement('script');
    e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
    e.async = true;
    document.getElementById('fb-root').appendChild(e);
  }());
</script>

<![endif]-->

<!--
<script src="http://static.ak.connect.facebook.com/js/api_lib/v0.4/FeatureLoader.js.php" type="text/javascript"></script>
<script type="text/javascript">FB.init("9a2987fa2d2b020899f658b6a2dbe161");</script>
-->



</body></html>
`

export class PostListController {

  constructor($scope,$http,$stateParams,$location,$anchorScroll,$ionicSlideBoxDelegate,$ionicHistory,$ionicPopover,$localstorage,$ionicModal,ngToast) {
    "use strict";
    console.log("called POST LIST CONTROLLER")
    this.scope = $scope
    this.http = $http
    this.location = $location
    this.anchorScroll = $anchorScroll
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.ionicHistory = $ionicHistory
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.localstorage = $localstorage
    this.ngToast = ngToast

    this.topicId = $stateParams.topicId
    this.page = $stateParams.page
    this.pages = []
    this.categories = []
    this.slidePages = [{},{},{}]
    this.currentIndex = 0
    this.currentPageNum = this.page - 1
    this.showSpinner = true
    this.newPostModal = {}
    const newPostModal = this.scope.newPostModal = $scope.$new()
    newPostModal.post = {}

    newPostModal.hide = () => this.newPostModal.hide()
    newPostModal.show = () => {
      console.log( this.categories)
      newPostModal.categories = this.categories
      this.newPostModal.show()
    }
    newPostModal.openCategoryPopover = ($event) => {
      newPostModal.categoryPopover.show($event)
    }
    newPostModal.openGifPopover = ($event) => {
      newPostModal.gifs = HKEPC.data.gifs
      newPostModal.gifPopover.show($event)
    }
    newPostModal.addGifCodeToText = (code) => {
      newPostModal.gifPopover.hide()
      const selectionStart = document.getElementById('new-content').selectionStart

      const content = newPostModal.post.content || ""

      const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

      newPostModal.post.content = `${splits[0]} ${code} ${splits[1]}`

    }
    newPostModal.selectCategory = (category) => {
      newPostModal.categoryPopover.hide()
      newPostModal.post.category = category
    }
    newPostModal.doPublishNewPost = (post) => {
      newPostModal.hide()
      console.log('do publist new post')

      if(post.title && post.content){

        this.http.get(HKEPC.forum.newPost(this.topicId))
            .then((resp) => {
              let $ = cheerio.load(resp.data)

              const relativeUrl = $('#postform').attr('action')
              const postUrl = `${HKEPC.baseUrl}/${relativeUrl}&infloat=yes&inajax=1`

              const hiddenFormInputs = $(`input[type='hidden']`).map((i,elem) => {
                const k = $(elem).attr('name')
                const v = $(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()

              console.log(hiddenFormInputs)

              const ionicReaderSign = HKEPC.signature()

              const subject = post.title
              const replyMessage = `${post.content}\n\n${ionicReaderSign}`
              const undefinedFilter = /.*=undefined$/i
              const postData = [
                `subject=${encodeURIComponent(subject)}`,
                `message=${encodeURIComponent(replyMessage)}`,
                `typeid=${post.category.id}`,
                `handlekey=newthread`,
                `topicsubmit=true`,
                hiddenFormInputs.join('&')
              ].filter(e => !undefinedFilter.test(e))
                  .join('&')

              //Post to the server
              this.http({
                method: "POST",
                url : postUrl,
                data : postData,
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              }).then((resp) => {

                this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈主題！</i>`)

                newPostModal.hide()

                this.doRefresh()

              })

            })
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 標題或內容不能空白！</i>`)
      }


    }


    $ionicModal.fromTemplateUrl('templates/modals/new-post.html', {
      scope: newPostModal
    }).then((modal) => {
      this.newPostModal = modal

      $ionicPopover.fromTemplateUrl('templates/modals/gifs.html', {
        scope: newPostModal
      }).then((popover) => {
        newPostModal.gifPopover = popover;
      })

      $ionicPopover.fromTemplateUrl('templates/modals/categories.html', {
        scope: newPostModal
      }).then((popover) => {
        newPostModal.categoryPopover = popover;
      })

    })

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/sub-forums.html', {
      scope: $scope
    }).then((popover) => {
      this.subTopicListPopover = popover
    })

    $scope.openPopover = ($event) => {
      if(this.subTopicList && this.subTopicList.length > 0){
        this.subTopicListPopover.show($event)
      }
    }

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.subTopicListPopover.remove()
      this.newPostModal.remove()
    })

    // create a UI rendering queue
    this.q = async.queue((task, callback) => {

      // update the post list
      const post = task()

      if(post.id || post.id != ""){
        const page = this.pages.find(p => p.num == post.pageNum)

        if(page){
          page.posts.push(post)
        }
      }

      if(this.q.length() % 3 == 0){
        // force update the view after 3 task
        this.scope.$apply()
      }
      setTimeout(() => callback(), 40)
    }, 1)

    $scope.$on('$ionicView.loaded', (e) => {
      setTimeout(() => this.loadMore(), 200)
    })

    $scope.$on('$ionicView.enter', (e) => {
      this.q.resume()

      // stringify and compare to string value
      this.showSticky = String(this.localstorage.get('showSticky')) === 'true'
    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      this.q.pause()
    })
  }

  loadMore(cb = () => {}){
    const nextPage = this.currentPageNum + 1
    this.http
        .get(HKEPC.forum.topics(this.topicId, nextPage))
        .then((resp) => {
          // hide the spinner
          this.showSpinner = false

          let $ = cheerio.load(resp.data)
          const titles = $('#nav').text().split('»')
          const topicName = titles[titles.length - 1]
          const totalPageNumText = $('.pages_btns .pages .last').first().text()
          const subTopicList = $('#subforum table h2 a').map((i,elem) => {
            const obj = $(elem)
            const name = obj.text()
            const id = URLUtils.getQueryVariable(obj.attr('href'), 'fid')
            return {
              id: id,
              name: name
            }
          }).get()

          const postCategories = $('.threadtype a').map((i,elem) => {
            const obj = $(elem)
            return {
              id: URLUtils.getQueryVariable(obj.attr('href'), 'typeid'),
              name: obj.text()
            }
          }).get()

          // select the current login user
          const currentUsername = $('#umenu > cite').text()

          // send the login name to parent controller
          this.scope.$emit("accountTabUpdate",currentUsername)

          // only extract the number
          this.totalPageNum = totalPageNumText
                              ? totalPageNumText.match(/\d/g).join("")
                              : 1

          this.subTopicList = subTopicList.length > 0
                              ? subTopicList
                              : this.subTopicList

          this.categories = postCategories

          const tasks = $('.threadlist table tbody').map( (i, elem) => {
            return () => {
              const htmlId = $(elem).attr('id')

              const postSource = cheerio.load($(elem).html())
              const postTitleImgUrl = postSource('tr .folder img').attr('src')

              return {
                id: URLUtils.getQueryVariable(postSource('tr .subject span a').attr('href'), 'tid'),
                topicId: this.topicId,
                tag: postSource('tr .subject em a').text(),
                name: postSource('tr .subject span[id^=thread_] a ').text(),
                lastPost:{
                  name: postSource('tr .lastpost cite a').text(),
                  timestamp: postSource('tr .lastpost em a').text()
                },
                author: {
                  name: postSource('tr .author a').text()
                },
                count: {
                  view: postSource('tr .nums em').text(),
                  reply: postSource('tr .nums strong').text()
                },
                publishDate: postSource('tr .author em').text(),
                pageNum: nextPage,
                isSticky: htmlId ? htmlId.startsWith("stickthread") : false,
                isRead: postTitleImgUrl ? postTitleImgUrl.indexOf('new') > 0 : false
              }
            }
          }).get()

          this.q.push(tasks, (err) => {
            // callback of each task if any
          })

          // when all task finished
          this.q.drain = () => {
            this.updateUI()
          }

          // push into the array
          this.pages.push({
            posts: [],
            num: nextPage
          })

          if(this.currentIndex == 0){
            this.slidePages[0] = this.pages[0]
          }

          this.topic = {
            id: this.topicId,
            name: topicName
          }

          cb(null)
          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          cb(err)
          // err.status will contain the status code
        })
  }

  updateUI(){
    this.ionicSlideBoxDelegate.update()
    this.scope.$apply()
  }

  reset(){
    this.q.kill()
    this.pages = []
    this.slidePages = [{},{},{}]
    this.ionicSlideBoxDelegate.slide(0,10)
    this.currentIndex = 0
    this.currentPageNum = 0
    this.showSpinner = true

  }

  doRefresh(){
    this.reset()
    this.loadMore(() => {
      this.scope.$broadcast('scroll.refreshComplete');
    })
  }

  onSlideChanged(index){
    if(this.slidePages.length == 0) return 0

    this.showSpinner = true

    //scroll to the hash tag
    this.location.hash(`ionic-slide-box`)
    this.anchorScroll()

    // clear the model first
    //this.slidePages[index] = []

    setTimeout(() => {
      const diff = this.currentIndex - index
      const pagesNums = this.pages.map(p => p.num)
      this.currentPageNum = this.slidePages[this.currentIndex].num
      this.ionicSlideBoxDelegate.$getByHandle('slideshow-slidebox')._instances[0].loop(true)


      if(diff == 1 || diff == -2){

        if(this.currentPageNum ==  1 || (this.currentIndex == 1 && this.currentPageNum == 2)) {
          // disable the does-continue if the it is the initial page
          this.ionicSlideBoxDelegate.$getByHandle('slideshow-slidebox')._instances[0].loop(false)
        }

        // previous page, i.e.  2 -> 1 , 1 -> 0 , 0 -> 2
        const smallestPageNum = Math.min.apply(Math, pagesNums)

        if(this.currentPageNum > smallestPageNum){
          console.log("default previous page")
          this.slidePages[index] = this.pages.find(page => page.num == this.currentPageNum - 1)

          // prefetch for better UX
          const prefetchSlideIndex = index - 1 < 0 ? 2 : index - 1
          this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum - 2)


        }
        else{
          console.log("loadMore Before()")
          // TODO: loadMoare beofre
        }
      }
      else{
        // next page
        const largestPageNum = Math.max.apply(Math, pagesNums)

        if(this.currentPageNum == this.totalPageNum){

          // TODO: should have a better UX instead of alert box
          alert("完")
          // scroll back the previous slides
          this.ionicSlideBoxDelegate.previous()
        }
        if(this.currentPageNum >= largestPageNum){
          console.log("loadMore After()")
          this.slidePages[index] = []
          this.loadMore(() => {
            const len = this.pages.length -1
            const nextPage = Math.floor(len / 3) * 3 + index
            this.slidePages[this.currentIndex] = this.pages[nextPage - 1]
            this.slidePages[index] = this.pages[nextPage]

            // prefetch for better UX
            const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
            this.slidePages[prefetchSlideIndex] = []
          })

        }
        else{
          console.log("default next page")
          this.slidePages[index] = this.pages.find(p => p.num == this.currentPageNum + 1)

          // prefetch for better UX
          const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
          this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum + 2)
        }

      }

      this.currentIndex = index
      this.updateUI()

    },100)

    console.log(`onSlideChanged${index}`)
  }


  goToSubTopic(index,subTopic){
    this.subTopicListPopover.hide();

    // swap the item in the list
    this.subTopicList[index] = this.topic
    this.topic = subTopic

    // override the topic id
    this.topicId = subTopic.id

    this.doRefresh()
  }

  saveShowSticky(bool) {
    this.localstorage.set('showSticky',bool)
  }

  doNewPost(topic){
    const newPostModal = this.scope.newPostModal
    newPostModal.topic = topic
    newPostModal.show()

  }
}
