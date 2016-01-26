import * as cheerio from "cheerio"
import * as HKEPC from "../data/config/hkepc"
import * as URLUtils from "../utils/url"
import * as Controllers from './controller/index'

/**
 * Register the controllers
 */
angular.module('starter.controllers', [])
.controller(Controllers.tab.name, Controllers.tab.action)

.controller(Controllers.topics.name, Controllers.topics.action)

.controller(Controllers.posts.name, Controllers.posts.action)

.controller(Controllers.post.name,Controllers.post.action)

.controller(Controllers.chats.name, Controllers.chats.action)

.controller(Controllers.chat.name, Controllers.chat.action)

.controller(Controllers.auth.name,Controllers.auth.action)
