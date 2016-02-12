import * as Controllers from './controller/index'

/**
 * Register the controllers
 */
const controllerModules = angular.module('starter.controllers', [])

for(let key of Object.keys(Controllers)){
  controllerModules.controller(Controllers[key].name,Controllers[key].action)
}