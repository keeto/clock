"use strict";
var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var application = models.application;

sp.require('js/player').setup(sp, models, application);
