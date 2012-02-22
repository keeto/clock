"use strict";
var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var views = sp.require('sp://import/scripts/api/views');
var application = models.application;

sp.require('js/utils').setup(sp, models, application);
sp.require('js/selectify').setup('.styled-select');
sp.require('js/player').setup(sp, models, views, application);
sp.require('js/clock').setup();
