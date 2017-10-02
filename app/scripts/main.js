/* jslint unparam: true, es5: true */
/* global $, document */

$(document).ready(function () {
    'use strict';
    var users = ['ESL_SC2', 'OgamingSC2', 'cretetion', 'freecodecamp', 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas', 'customer404'],
        viewDatas = []; // item : {display_name: 'xxx', index: 0, logo: 'xxx', status: 'xxx', url: 'xxx', onOff: "online"}

    function render() {
        var type = $('input[name=options]:checked').val();
        var newViewDatas = viewDatas.filter(function(value) {
            if (type === 'all')
                return true;
            else
                return type === value.onOff;
        });
        var search = $('#nameFilter').val();
        if (search !== '') {
            newViewDatas = newViewDatas.filter(function(value) {
                if (value.display_name.match(new RegExp(search,'ig')) !== null)
                    return true;
                else
                    return false;
            });
        }
        $('#media-list').empty();
        newViewDatas.forEach((element, index, array) => {
            $('#media-list').append('            <li class="media">\
              <div class="media-left">\
                <a target="_blank" href="' + element.url + '">\
                  <img class="media-object img-circle" src="' + element.logo +'" width="80" height="80" alt="logo"></a>\
              </div>\
              <div class="media-body">\
                <h4 class="media-heading">' + element.display_name + '</h4>\
                ' + element.status + '\
              </div>\
            </li>\
');
        });
    }

    $('.btn-group .btn input').change(function () {
        render();
    });

    $('#nameFilter').on('input', function () {
        render();
    });

    function loadData() {
        var requests = users.map((element, index, array) => {
            return new Promise((resolve, reject) => {
            $.ajax({
                method: 'GET',
                url: 'https://wind-bow.gomix.me/twitch-api/channels/' + element,
                dataType: 'jsonp',
                contentType: 'application/vnd.twitchtv[.version]+json',
                data: {}
            })
                .done(function (channel) {
                    var viewData = {};
                    viewData.index = index;
                    if (channel.status === 404) {
                        viewData.display_name = element;
                        viewData.logo = 'https://placehold.it/300x300?text=?';
                        viewData.url = '#';
                        viewData.status = 'Account Not Found';
                        viewData.onOff = 'offline';
                        resolve(viewData);
                    } else {
                        viewData.display_name = channel.display_name;
                        viewData.logo = channel.logo;
                        viewData.url = channel.url;
                        $.ajax({
                            method: 'GET',
                            url: 'https://wind-bow.gomix.me/twitch-api/streams/' + element,
                            dataType: 'jsonp',
                            contentType: 'application/vnd.twitchtv[.version]+json',
                            data: {}
                        })
                            .done(function (stream) {
                                if (stream.stream === null) {
                                    viewData.status = 'Offline';
                                    viewData.onOff = 'offline';
                                } else {
                                    viewData.status = stream.stream.game + ':' + stream.stream.channel.status;
                                    viewData.onOff = 'online';
                                }
                                resolve(viewData);
                            })
                            .fail(function (jqXHR, textStatus) {
                                reject(textStatus);
                            });
                    }
                })
                .fail(function (jqXHR, textStatus) {
                    reject(textStatus);
                });
            })
        });
        return Promise.all(requests);
    }

 
    loadData().then((array) => {
    	viewDatas = array;
    	render();
    });


});

