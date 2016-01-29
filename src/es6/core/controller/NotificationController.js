/**
 * Created by Gaplo917 on 29/1/2016.
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
<title> 電腦領域 HKEPC Hardware  - 全港 No.1 PC討論區 - Powered by Discuz!</title>
<meta name="keywords" content="電腦,新聞,硬件,軟件,行動電腦,主機板,處理器,鏳圖卡,記憶體,遊戲,拍攝,體育,交易,pc,news,hardware,software,notebook,mainboard,motherboard,cpu,display,ram,cd,dvd,game,photo,camera,sport,adata,,asrock,asus,ati,delta,gigabyte,his,intel,lg,magic pro,msi,nvidia,samsung,shuttle,everbest,shotting,synnex,core2,athlon,geforce,radeon,eeepc,lunix,windows,xp,vista,mac,apple,ddr3,hdmi,dvi,agp">
<meta name="description" content=" 電腦領域 HKEPC Hardware   - Discuz! Board">
<meta name="generator" content="Discuz! 7.2">
<meta name="author" content="Discuz! Team and Comsenz UI Team">
<meta name="copyright" content="2001-2009 Comsenz Inc.">
<meta name="MSSmartTagsPreventParsing" content="True">
<meta http-equiv="MSThemeCompatible" content="Yes">
<link rel="archives" title="電腦領域 HKEPC Hardware " href="http://www.hkepc.com/forum/archiver/">
<link rel="stylesheet" type="text/css" href="forumdata/cache/style_28_common.css?jJK"><link rel="stylesheet" type="text/css" href="forumdata/cache/scriptstyle_28_notice.css?jJK">
<script type="text/javascript" async="" src="http://www.google-analytics.com/ga.js"></script><script type="text/javascript">var STYLEID = '28', IMGDIR = 'images/default', VERHASH = 'jJK', charset = 'utf-8', discuz_uid = 143676, cookiedomain = '.hkepc.com', cookiepath = '/', attackevasive = '0', disallowfloat = 'tradeorder|debate|usergroups|task', creditnotice = '', gid = 0, fid = parseInt('0'), tid = parseInt('0')</script>
<script src="forumdata/cache/common.js?jJK" type="text/javascript"></script>
<script src="include/js/jquery.js?jJK" type="text/javascript"></script>
<style type="text/css">.fb_hidden{position:absolute;top:-10000px;z-index:10001}.fb_reposition{overflow-x:hidden;position:relative}.fb_invisible{display:none}.fb_reset{background:none;border:0;border-spacing:0;color:#000;cursor:auto;direction:ltr;font-family:"lucida grande", tahoma, verdana, arial, sans-serif;font-size:11px;font-style:normal;font-variant:normal;font-weight:normal;letter-spacing:normal;line-height:1;margin:0;overflow:visible;padding:0;text-align:left;text-decoration:none;text-indent:0;text-shadow:none;text-transform:none;visibility:visible;white-space:normal;word-spacing:normal}.fb_reset>div{overflow:hidden}.fb_link img{border:none}
.fb_dialog{background:rgba(82, 82, 82, .7);position:absolute;top:-10000px;z-index:10001}.fb_reset .fb_dialog_legacy{overflow:visible}.fb_dialog_advanced{padding:10px;-moz-border-radius:8px;-webkit-border-radius:8px;border-radius:8px}.fb_dialog_content{background:#fff;color:#333}.fb_dialog_close_icon{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yq/r/IE9JII6Z1Ys.png) no-repeat scroll 0 0 transparent;_background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yL/r/s816eWC-2sl.gif);cursor:pointer;display:block;height:15px;position:absolute;right:18px;top:17px;width:15px}.fb_dialog_mobile .fb_dialog_close_icon{top:5px;left:5px;right:auto}.fb_dialog_padding{background-color:transparent;position:absolute;width:1px;z-index:-1}.fb_dialog_close_icon:hover{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yq/r/IE9JII6Z1Ys.png) no-repeat scroll 0 -15px transparent;_background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yL/r/s816eWC-2sl.gif)}.fb_dialog_close_icon:active{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yq/r/IE9JII6Z1Ys.png) no-repeat scroll 0 -30px transparent;_background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yL/r/s816eWC-2sl.gif)}.fb_dialog_loader{background-color:#f6f7f8;border:1px solid #606060;font-size:24px;padding:20px}.fb_dialog_top_left,.fb_dialog_top_right,.fb_dialog_bottom_left,.fb_dialog_bottom_right{height:10px;width:10px;overflow:hidden;position:absolute}.fb_dialog_top_left{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 0;left:-10px;top:-10px}.fb_dialog_top_right{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 -10px;right:-10px;top:-10px}.fb_dialog_bottom_left{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 -20px;bottom:-10px;left:-10px}.fb_dialog_bottom_right{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ye/r/8YeTNIlTZjm.png) no-repeat 0 -30px;right:-10px;bottom:-10px}.fb_dialog_vert_left,.fb_dialog_vert_right,.fb_dialog_horiz_top,.fb_dialog_horiz_bottom{position:absolute;background:#525252;filter:alpha(opacity=70);opacity:.7}.fb_dialog_vert_left,.fb_dialog_vert_right{width:10px;height:100%}.fb_dialog_vert_left{margin-left:-10px}.fb_dialog_vert_right{right:0;margin-right:-10px}.fb_dialog_horiz_top,.fb_dialog_horiz_bottom{width:100%;height:10px}.fb_dialog_horiz_top{margin-top:-10px}.fb_dialog_horiz_bottom{bottom:0;margin-bottom:-10px}.fb_dialog_iframe{line-height:0}.fb_dialog_content .dialog_title{background:#6d84b4;border:1px solid #3a5795;color:#fff;font-size:14px;font-weight:bold;margin:0}.fb_dialog_content .dialog_title>span{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yd/r/Cou7n-nqK52.gif) no-repeat 5px 50%;float:left;padding:5px 0 7px 26px}body.fb_hidden{-webkit-transform:none;height:100%;margin:0;overflow:visible;position:absolute;top:-10000px;left:0;width:100%}.fb_dialog.fb_dialog_mobile.loading{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/ya/r/3rhSv5V8j3o.gif) white no-repeat 50% 50%;min-height:100%;min-width:100%;overflow:hidden;position:absolute;top:0;z-index:10001}.fb_dialog.fb_dialog_mobile.loading.centered{width:auto;height:auto;min-height:initial;min-width:initial;background:none}.fb_dialog.fb_dialog_mobile.loading.centered #fb_dialog_loader_spinner{width:100%}.fb_dialog.fb_dialog_mobile.loading.centered .fb_dialog_content{background:none}.loading.centered #fb_dialog_loader_close{color:#fff;display:block;padding-top:20px;clear:both;font-size:18px}#fb-root #fb_dialog_ipad_overlay{background:rgba(0, 0, 0, .45);position:absolute;left:0;top:0;width:100%;min-height:100%;z-index:10000}#fb-root #fb_dialog_ipad_overlay.hidden{display:none}.fb_dialog.fb_dialog_mobile.loading iframe{visibility:hidden}.fb_dialog_content .dialog_header{-webkit-box-shadow:white 0 1px 1px -1px inset;background:-webkit-gradient(linear, 0% 0%, 0% 100%, from(#738ABA), to(#2C4987));border-bottom:1px solid;border-color:#1d4088;color:#fff;font:14px Helvetica, sans-serif;font-weight:bold;text-overflow:ellipsis;text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0;vertical-align:middle;white-space:nowrap}.fb_dialog_content .dialog_header table{-webkit-font-smoothing:subpixel-antialiased;height:43px;width:100%}.fb_dialog_content .dialog_header td.header_left{font-size:12px;padding-left:5px;vertical-align:middle;width:60px}.fb_dialog_content .dialog_header td.header_right{font-size:12px;padding-right:5px;vertical-align:middle;width:60px}.fb_dialog_content .touchable_button{background:-webkit-gradient(linear, 0% 0%, 0% 100%, from(#4966A6), color-stop(.5, #355492), to(#2A4887));border:1px solid #2f477a;-webkit-background-clip:padding-box;-webkit-border-radius:3px;-webkit-box-shadow:rgba(0, 0, 0, .117188) 0 1px 1px inset, rgba(255, 255, 255, .167969) 0 1px 0;display:inline-block;margin-top:3px;max-width:85px;line-height:18px;padding:4px 12px;position:relative}.fb_dialog_content .dialog_header .touchable_button input{border:none;background:none;color:#fff;font:12px Helvetica, sans-serif;font-weight:bold;margin:2px -12px;padding:2px 6px 3px 6px;text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0}.fb_dialog_content .dialog_header .header_center{color:#fff;font-size:16px;font-weight:bold;line-height:18px;text-align:center;vertical-align:middle}.fb_dialog_content .dialog_content{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/y9/r/jKEcVPZFk-2.gif) no-repeat 50% 50%;border:1px solid #555;border-bottom:0;border-top:0;height:150px}.fb_dialog_content .dialog_footer{background:#f6f7f8;border:1px solid #555;border-top-color:#ccc;height:40px}#fb_dialog_loader_close{float:left}.fb_dialog.fb_dialog_mobile .fb_dialog_close_button{text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0}.fb_dialog.fb_dialog_mobile .fb_dialog_close_icon{visibility:hidden}#fb_dialog_loader_spinner{animation:rotateSpinner 1.2s linear infinite;background-color:transparent;background-image:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/yD/r/t-wz8gw1xG1.png);background-repeat:no-repeat;background-position:50% 50%;height:24px;width:24px}@keyframes rotateSpinner{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.fb_iframe_widget{display:inline-block;position:relative}.fb_iframe_widget span{display:inline-block;position:relative;text-align:justify}.fb_iframe_widget iframe{position:absolute}.fb_iframe_widget_fluid_desktop,.fb_iframe_widget_fluid_desktop span,.fb_iframe_widget_fluid_desktop iframe{max-width:100%}.fb_iframe_widget_fluid_desktop iframe{min-width:220px;position:relative}.fb_iframe_widget_lift{z-index:1}.fb_hide_iframes iframe{position:relative;left:-10000px}.fb_iframe_widget_loader{position:relative;display:inline-block}.fb_iframe_widget_fluid{display:inline}.fb_iframe_widget_fluid span{width:100%}.fb_iframe_widget_loader iframe{min-height:32px;z-index:2;zoom:1}.fb_iframe_widget_loader .FB_Loader{background:url(https://fbstatic-a.akamaihd.net/rsrc.php/v2/y9/r/jKEcVPZFk-2.gif) no-repeat;height:32px;width:32px;margin-left:-16px;position:absolute;left:50%;z-index:4}</style></head>

<body id="notice" onkeydown="if(event.keyCode==27) return false;">
<div id="fb-root" class=" fb_reset"><script src="http://connect.facebook.net/en_US/all.js" async=""></script><div style="position: absolute; top: -10000px; height: 0px; width: 0px;"><div><iframe name="fb_xdm_frame_http" frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no" title="Facebook Cross Domain Communication Frame" aria-hidden="true" tabindex="-1" id="fb_xdm_frame_http" src="http://staticxx.facebook.com/connect/xd_arbiter.php?version=42#channel=f2aee18298&amp;origin=http%3A%2F%2Fwww.hkepc.com" style="border: none;"></iframe><iframe name="fb_xdm_frame_https" frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no" title="Facebook Cross Domain Communication Frame" aria-hidden="true" tabindex="-1" id="fb_xdm_frame_https" src="https://staticxx.facebook.com/connect/xd_arbiter.php?version=42#channel=f2aee18298&amp;origin=http%3A%2F%2Fwww.hkepc.com" style="border: none;"></iframe></div></div><div style="position: absolute; top: -10000px; height: 0px; width: 0px;"><div></div></div></div>

<div id="outer_wrap">

<div id="append_parent"></div><div id="ajaxwaitid" style="display: none;"></div>

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
<div id="nav"><a href="index.php">電腦領域 HKEPC Hardware </a> » 提醒</div>

<div id="wrap" class="wrap with_side s_clear">
<div class="main">
<div class="content">
<div class="itemtitle s_clear">
<h1>提醒</h1>
</div>

<div class="pm_header colplural itemtitle s_clear">
<ul>
<li class="current"><a href="notice.php" hidefocus="true"><span>全部</span></a></li><li><a href="notice.php?filter=systempm"><span>系統消息</span></a></li><li><a href="notice.php?filter=friend"><span>好友消息</span></a></li><li><a href="notice.php?filter=threads"><span>帖子消息</span></a></li></ul>

</div>

<ul class="feed"><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=28269">goofyz</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-28 23:06">昨天&nbsp;23:06</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>話時話 想你有無問 EPC 拎 Approval 去比你 parse 佢啲 HTML ?</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=28269">goofyz</a> 說：</dt><dd>當然係......</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34443143">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34443143&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=28269">goofyz</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-28 15:45">昨天&nbsp;15:45</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>有 public 的，可以直接 Call 到

佢無用到 App secret 做 Auth, 任何人知道 endpoint 都可以 call ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=28269">goofyz</a> 說：</dt><dd>好似無公開過？
知道 endpoint 但無公開過算唔算 public 呢</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34442050">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34442050&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_reply"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=13164">happyt610</a> 答覆了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-28 13:54">昨天&nbsp;13:54</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>放心，基本功能，Login 、睇POST、 留言、睇 PM    ( 呢啲用幾日就做好  ）

 一定 ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=13164">happyt610</a> 說：</dt><dd>回覆  hihihi123hk


支持CHING,

期待有好消息</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34441678">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34441678&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=262316">s.friday1004</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-28 11:29">昨天&nbsp;11:29</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>同埋 API 有嘅 Data 比起版 HTML 少好多資訊</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=262316">s.friday1004</a> 說：</dt><dd>咁已經係最大理由啦
你個app 寫得好好
介面靚功能足
代Iphone 用家多謝你</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34441095">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34441095&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=143249">l0001</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-28 01:52">昨天&nbsp;01:52</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>將 parse HTML 換成 Call API 好簡單

但你知唔知其它 Android Epc client 係咪都係用 API 去砌？ ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=143249">l0001</a> 說：</dt><dd>我只知EPC Pocket 唔係，其他既未用過</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34440718">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34440718&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=143249">l0001</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-27 23:44">前天&nbsp;23:44</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>無論點樣 Content 都係屬於 HKEPC ，點去拎其實係無分別

最緊要佢授權我 Process 佢啲 Content,  ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=143249">l0001</a> 說：</dt><dd>HKEPC android 係用 restful API 的，不過應該唔係Public....但係效能就會好過parse html ...</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34440460">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34440460&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=19473">bsuper</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2260666">所有streaming既片都load唔出</a> 發表的帖子 <em><span title="2016-1-27 23:42">前天&nbsp;23:42</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>回覆  bsuper



拎部電腦出廳

駁廳條 lan 線試下先</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=19473">bsuper</a> 說：</dt><dd>禮拜日試試
但係今日突然間streaming無事
但係到其他網站有事
appledaily所有video都load唔出........... ...</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=126&amp;tid=2260666&amp;reppost=34440454">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34440454&amp;ptid=2260666">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=143249">l0001</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-27 23:24">前天&nbsp;23:24</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>其實都未知上唔上到架，

應該要同 EPC 啲人溝通咗先，始終啲 Content 係人地嘅

理應上要有野証明 ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=143249">l0001</a> 說：</dt><dd>想問下點解唔用佢android版既方法去拎content?</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34440388">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34440388&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_reply"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=262316">s.friday1004</a> 答覆了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-27 18:55">前天&nbsp;18:55</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>放心，基本功能，Login 、睇POST、 留言、睇 PM    ( 呢啲用幾日就做好  ）

 一定 ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=262316">s.friday1004</a> 說：</dt><dd>回覆  hihihi123hk
點解會有 like, comment, 同share 既</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34439616">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34439616&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_reply"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=38816">cosine</a> 答覆了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-27 13:05">前天&nbsp;13:05</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>回覆  cosine



developer?</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=38816">cosine</a> 說：</dt><dd>yes. (hybrid mobile app)</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34438602">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34438602&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_reply"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=121921">agent_smith</a> 答覆了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-27 09:09">前天&nbsp;09:09</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>呢個已經落左架喇 ，上次諗住重裝，刪完搵唔番 ....

細細聲講 XD：「我用咗十日時間 自己寫咗個 i ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=121921">agent_smith</a> 說：</dt><dd>good job</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34437972">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34437972&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=38816">cosine</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-27 08:38">前天&nbsp;08:38</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>呢個已經落左架喇 ，上次諗住重裝，刪完搵唔番 ....

細細聲講 XD：「我用咗十日時間 自己寫咗個 i ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=38816">cosine</a> 說：</dt><dd>directly parse html?</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34437936">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34437936&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=306742">justinjoseph</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2263076">IOS 個HKEPC app 。。</a> 發表的帖子 <em><span title="2016-1-27 02:32">前天&nbsp;02:32</span></em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>呢個已經落左架喇 ，上次諗住重裝，刪完搵唔番 ....

細細聲講 XD：「我用咗十日時間 自己寫咗個 i ...</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=306742">justinjoseph</a> 說：</dt><dd>等你個app</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=121&amp;tid=2263076&amp;reppost=34437786">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34437786&amp;ptid=2263076">查看</a></p></div></li><li class="s_clear">favoritethreads_notice</li><li class="s_clear"><div class="f_quote"><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=321850">Y你特曲</a> 引用了您曾經在主題 <a href="http://www.hkepc.com/forum/viewthread.php?from=notice&amp;tid=2260476">無線叉電會唔會好慢?</a> 發表的帖子 <em>2016-1-18 11:08</em>
<dl class="summary"><dt>您的帖子：</dt><dt></dt><dd>無線叉無咁環保， 轉換率好似得 六七成</dd><dt><a href="http://www.hkepc.com/forum/space.php?from=notice&amp;uid=321850">Y你特曲</a> 說：</dt><dd>5V*1A=5W，40%=2W。
當你差足一個月，浪費咗既電力係2W*24*30=1.4KWH，大約係HKD1.4 既電費。
如果講環 ...</dd></dl>
<p><a href="http://www.hkepc.com/forum/post.php?from=notice&amp;action=reply&amp;fid=15&amp;tid=2260476&amp;reppost=34408484">回覆</a><i>|</i><a href="http://www.hkepc.com/forum/redirect.php?from=notice&amp;goto=findpost&amp;pid=34408484&amp;ptid=2260476">查看</a></p></div></li></ul>
<div><div class="pages"><strong>1</strong><a href="notice.php?page=2">2</a><a href="notice.php?page=3">3</a><a href="notice.php?page=4">4</a><a href="notice.php?page=5">5</a><a href="notice.php?page=6">6</a><a href="notice.php?page=7">7</a><a href="notice.php?page=8">8</a><a href="notice.php?page=9">9</a><a href="notice.php?page=10">10</a><a href="notice.php?page=57" class="last">... 57</a><a href="notice.php?page=2" class="next">下一頁</a></div></div>
</div>
</div>
<div class="side"><h2>個人中心</h2>
<div class="sideinner">
<ul class="tabs">
<li><a href="memcp.php?action=profile&amp;typeid=3" id="uploadavatar" prompt="uploadavatar">修改頭像</a></li>
<li><a href="memcp.php?action=profile&amp;typeid=2">個人資料</a></li>
<li><a href="pm.php">短消息</a></li>
<li class="current"><a href="notice.php">提醒</a></li>
<li><a href="my.php?item=buddylist&amp;">我的好友</a></li>
</ul>
</div>

<hr class="shadowline">

<div class="sideinner">
<ul class="tabs">
<li><a href="my.php?item=threads">我的帖子</a></li>
<li><a href="my.php?item=favorites&amp;type=thread">我的收藏</a></li>
<li><a href="my.php?item=attention&amp;type=thread">我的關注</a></li>
</ul>
</div>

<hr class="shadowline">

<div class="sideinner">
<ul class="tabs">
<li><a href="memcp.php?action=credits">積分</a></li>
<li><a href="memcp.php?action=usergroups">用戶組</a></li>
<li><a href="task.php">論壇任務</a></li>
<li><a href="medal.php">勳章</a></li></ul>
</div>

<hr class="shadowline">

<div class="sideinner">
<ul class="tabs">
<li><a href="memcp.php?action=profile&amp;typeid=5">論壇個性化設定</a></li>
<li><a href="memcp.php?action=profile&amp;typeid=1">密碼和安全問題</a></li>
</ul>
</div>

<hr class="shadowline">

<div class="sideinner">
<ul class="tabs">
<li>積分: 3693</li><li>EPC Dollar: 3693 </li></ul>
</div>
</div>

</div>
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
GMT+8, 2016-1-29 01:44, <span id="debuginfo">Processed in 0.070529 second(s), 6 queries</span>.
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



</body></html>`
export class NotificationController{

  constructor($scope, $http, authService,$state,$sce){

    this.http = $http
    this.scope = $scope
    this.sce = $sce
    this.notifications = []
    this.state = $state

    $scope.$on('$ionicView.enter', (e) => {
      authService.loginFromDb((err) => {
        if(err){
          alert("請先登入！")
          $state.go("tab.account")
        } else {
          setTimeout(()=> {
            this.loadNotifications()
          },400)
        }
      })

    })
  }

  loadNotifications(){
    //this.http.get("http://www.hkepc.com/forum/redirect.php?from=notice&goto=findpost&pid=34443143&ptid=2263076")
    //.then((resp, status, headers) => {
    //  const html = new GeneralHtml(cheerio.load(resp.data))
    //
    //  let $ = html
    //      .removeIframe()
    //      .processImgUrl(HKEPC.baseUrl)
    //      .getCheerio()
    //
    //  const page = $('.forumcontrol .pages strong').first().text()
    //  const pageBtnSource = $('.forumcontrol .pages a').first()
    //  const topicId = URLUtils.getQueryVariable(pageBtnSource.attr('href'), 'fid')
    //  const postId = URLUtils.getQueryVariable(pageBtnSource.first().attr('href'), 'tid')
    //
    //  console.log(page,topicId,postId)
    //
    //  const url = this.state.href('tab.topics-posts-detail',{
    //    topicId: topicId,
    //    postId: postId,
    //    page: page
    //  })
    //  console.log(url)
    //
    //  window.location.href = url
    //  //console.log($('#pid34443143').html())
    //})

    this.http
        .get(HKEPC.forum.notifications())
        .then((resp) => {
          resp.data = testData
          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseUrl)
              .getCheerio()

          const notifications = $('.feed li .f_quote').map((i, elem) => {
            return this.sce.trustAsHtml($(elem).html())
          }).get()


          this.notifications = notifications

        },(err) => {
          console.log(err)
        })
  }
}