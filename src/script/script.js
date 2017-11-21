/* jshint laxbreak:true */

/* //////////////////////////////////////////////////////////////////////////////// */
/* /////////////////////////////////////////////////////////////////// DOCUMENT /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ------------------------------------------------------------------------ VAR --- */
var DOMAIN = 'automation.blanks.by';
var CONFIG_PATH = '//' + DOMAIN + '/config.json';
var config;

/* ---------------------------------------------------------------------- READY --- */
$(document).on('ready', init);

/* ----------------------------------------------------------------------- INIT --- */
function init() {
    document_init();
    nav_init();
    layer_init();
	socket_init();

	config_init();
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////// HELPER /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ------------------------------------------------------------------ JSON LOAD --- */
function json_load(file_path, callback) {
	var xhr,
		config;

	xhr = new XMLHttpRequest();
	xhr.overrideMimeType('application/json');
    xhr.open('GET', file_path, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
        	config = JSON.parse(xhr.responseText);

            callback(config);
        }
    };
    xhr.send(null);
}

/* -------------------------------------------------------- REMOVE CLASS PREFIX --- */
$.fn.removeClassPrefix = function(prefix) {
    this.each(function(i, el) {
        var classes = el.className.split(" ").filter(function(c) {
            return c.lastIndexOf(prefix, 0) !== 0;
        });
        el.className = $.trim(classes.join(" "));
    });
    return this;
};


/* //////////////////////////////////////////////////////////////////////////////// */
/* /////////////////////////////////////////////////////////////////// DOCUMENT /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function document_init() {
	document_band();
}

/* ----------------------------------------------------------------------- BAND --- */
function document_band() {
	document.body.addEventListener('touchmove', function(event) {
		// if (event.source == document.body)
		event.preventDefault();
	}, false);

	window.onresize = function() {
		$(document.body).width(window.innerWidth).height(window.innerHeight);
	};

	$(function() {
		window.onresize();
	});
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* //////////////////////////////////////////////////////////////////////// NAV /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function nav_init() {
	nav_toggle();
	nav_back();
	nav_swipe();
}

/* --------------------------------------------------------------------- TOGGLE --- */
function nav_toggle() {
	$('.room_list').on('tap', '.room', function() {
		var $header,
			$overview,
			$room;
		var room_id,
			room_name;

		$header = $('header');
		$overview = $('#overview');

		room_id = $(this).attr('data-room-id');
		room_name = $(this).attr('data-room-name');

		$room = $('#room_' + room_id);

		$header.find('a.back').addClass('display');
		$header.find('.title').html(room_name);

		$('.page').removeClass('display active');
		$overview.addClass('display_left_out active');
		$room.addClass('display_right_in display');

		$overview.bind('animationend', function() {
			$('.page').removeClassPrefix('display_');
			$overview.removeClass('active');
		});
	});

	$('footer a').on('tap', function() {
		var $header,
			$footer,
			$current,
			$page;
		var index,
			page_id,
			page_name;

		if ($(this).hasClass('active')) return;

		$header = $('header');
		$footer = $('footer');
		$current = $('.page.display');

		index = $(this).index();
		page_id = $(this).attr('data-page-id');
		page_name = $(this).attr('data-page-name');

		$page = $('#' + page_id);

		$header.find('a.back').removeClass('display');
		$header.find('.title').html(page_name);

		$('.page').removeClass('display active');

		if (index < 1) {
			$current.addClass('display_right_out active');
			$page.addClass('display_left_in display');
		} else {
			$current.addClass('display_left_out active');
			$page.addClass('display_right_in display');
		}

		$footer.find('a').removeClass('active').filter($(this).addClass('active'));

		$page.bind('animationend', function(event) {
			$('.page').removeClassPrefix('display_');
			$current.removeClass('active');
		});
	});
}

/* ----------------------------------------------------------------------- BACK --- */
function nav_back() {
	$('header .back').on('tap', function() {
		var $header,
			$overview;

		$header = $('header');
		$overview = $('#overview');

		$header.find('a.back').removeClass('display');
		$header.find('.title').html('Overview');

		$('.page:not(.display)').removeClass('display active');
		$('.page.display').addClass('display_right_out active').removeClass('display');
		$overview.addClass('display_left_in display');

		$overview.bind('animationend', function() {
			$('.page').removeClassPrefix('display_');
			$('.page.active').removeClass('active');
		});
	});
}

/* ---------------------------------------------------------------------- SWIPE --- */
function nav_swipe() {
    var $header;
    var win_width,
        win_height,
        swipe_active;

    $header = $('header');
    $overview = $('#overview');

    win_width = $(window).width();
    win_height = $(window).height();
    swipe_complete = false;
    swipe_active = false;

    $(document).on('touchstart', function(event) {
        var touches;

        touches = event.originalEvent.touches[0];

        down_x = touches.pageX;
        down_y = touches.pageY;

        if ($header.find('a.back.display').length > 0
            && down_x <= 30
            && down_y >= (win_height * 0.2)
            && down_y <= (win_height * 1) - (win_height * 0.2)) {
            swipe_active = true;
        }
    })
    .on('touchmove', function(event) {
        var $page;
        var touches,
            translate_x;

        $page = $('.page.display');

        touches = event.originalEvent.touches[0];
        translate_x = (Math.max(0, (touches.pageX / win_width) - 0.03) * 100);

        if (swipe_active === true) {
            if (translate_x > 50) {
                swipe_complete = true;
            } else {
                swipe_complete = false;
            }

            $overview.addClass('active swipe').css('transform', 'translateX(-' + (100 - translate_x) + '%)'); 
            $page.addClass('swipe').css('transform', 'translateX(' + translate_x + '%)');
        }
    })
    .on('touchend',function(event) {
        var $page;

        $('.page').off('transitionend');
        $overview.off('transitionend');

        if (swipe_complete === true) {
            $page = $('.page.display');

            $header.find('a.back').removeClass('display');

            $page.removeClass('swipe').css('transform', 'translateX(100%)').on('transitionend', function() {
                $page.removeClass('display').css('transform', '');
            });

            $overview.removeClass('swipe').css('transform', 'translateX(0)').on('transitionend', function() {
                $overview.removeClass('active').addClass('display').css('transform', '');
            });
        } else if (swipe_active === true) {
            $page = $('.page.swipe');

            $page.removeClass('swipe').css('transform', '');

            $overview.removeClass('swipe').css('transform', '').on('transitionend', function() {
                $overview.removeClass('active');
            });
        }

        swipe_active = false;
        swipe_complete = false;
    });
}

/* //////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////// LAYER /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function layer_init() {
    layer_close();
}

/* ---------------------------------------------------------------------- CLOSE --- */
function layer_close() {
    var $layer;
    var win_height,
        layer_offset,
        swipe_active,
        swipe_complete;

    win_height = $(window).height();
    swipe_active = false;
    swipe_complete = false;

    $('.layer > .toggle').on('touchstart', function(event) {
        swipe_active = true;

        $layer = $(this).closest('.layer');

        layer_offset = $layer.offset().top;
    });

    $(document).on('touchmove', function(event) {
        if (swipe_active !== true) return;

        var touches,
            translate_y;

        touches = event.originalEvent.touches[0];
        translate_y = ((-93 + (touches.pageY - layer_offset)) / win_height) * 100;

        if (translate_y > 20) {
            swipe_complete = true;
        } else {
            swipe_complete = false;
        }

        $layer.addClass('swipe').css('transform', 'translateY(' + translate_y + '%)');
    })
    .on('touchend',function(event) {
        if (swipe_active !== true) return;

        $layer.off('transitionend');

        if (swipe_complete === true) {
            $layer.removeClass('swipe').css('transform', 'translateY(calc(100% - 57px))').on('transitionend', function() {
                $layer.removeClass('display').css('transform', '');

                $layer.off('transitionend');
                $layer.removeData();
            });
        } else if (swipe_active === true) {
            $layer.removeClass('swipe').css('transform', '').on('transitionend', function() {
                $layer.off('transitionend');
            });
        }

        swipe_active = false;
        swipe_complete = false;
    });
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////// SOCKET /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function socket_init() {
	socket_connect();
}

/* -------------------------------------------------------------------- CONNECT --- */
function socket_connect() {
	socket_orvibo_connect();
	socket_bravia_connect();
	socket_yeelight_connect();
}

/* ------------------------------------------------------------- ORVIBO CONNECT --- */
function socket_orvibo_connect() {
	var server;

	server = io.connect(DOMAIN + ':3001');

	socket_state(server);
}

/* ------------------------------------------------------------- BRAVIA CONNECT --- */
function socket_bravia_connect() {
	var server;

	server = io.connect(DOMAIN + ':3002');

	socket_state(server);
}

/* ----------------------------------------------------------- YEELIGHT CONNECT --- */
function socket_yeelight_connect() {
	var server;

	// server = io.connect(DOMAIN + ':3003');
    server = io.connect('//192.168.0.11:3003');

	socket_state(server);
}

/* ---------------------------------------------------------------------- STATE --- */
function socket_state(server) {
	server.on('statechange', function(device) {
		device_state_set(device);
	});
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* /////////////////////////////////////////////////////////////////////// DATA /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function config_init() {
	config_load();
}

/* ----------------------------------------------------------------------- LOAD --- */
function config_load() {
	json_load(CONFIG_PATH, function(data) {
		config = data;

		room_init();
		device_init();
		scene_init();
		range_init();
        picker_init();
	});
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* /////////////////////////////////////////////////////////////////////// ROOM /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function room_init() {
	room_render();
}

/* --------------------------------------------------------------------- RENDER --- */
function room_render() {
	$.each(config.rooms, function(_, room) {
        var $page,
            $room;
		var count;

        $page = $('#room.page.clone').clone(true, true).removeClass('clone');
        $room = $('#overview .room_list .room.clone').clone(true, true).removeClass('clone');
		count = room_device_count(room.id);

        $page.attr('id', $page.attr('id') + '_' + room.id);
        $page.addClass(room.slug);

        $room.attr('data-room-id', room.id);
        $room.attr('data-room-name', room.name);
        $room.addClass(room.slug);
        $room.find('.name').html(room.name);
        $room.find('.device span').html(count);
        $room.find('.device span').after(' ' + (count == 1 ? 'Device' : 'Devices'));

        $('body').append($page);
		$('main .room_list').append($room);
	});
}

/* --------------------------------------------------------------- DEVICE COUNT --- */
function room_device_count(room_id) {
	var count;

	count = 0;

	$.each(config.devices, function(_, device) {
		if (device.room == room_id) {
			count++;
		}
	});

	return count;
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////// DEVICE /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function device_init() {
	device_render();

	device_toggle();
	device_brightness();
    device_swatch();
}

/* --------------------------------------------------------------------- RENDER --- */
function device_render() {
	$.each(config.devices, function(_, device) {
		var $device_list,
			$device;

		$device_list = $('#room_' + device.room + ' .device_list');

        $device = $device_list.find('.device.clone').clone(true, true).removeClass('clone');

		$device.attr('data-device-ip', JSON.stringify(device.ip));
		$device.attr('data-device-mac', JSON.stringify(device.mac));
        $device.find('.control .icon').addClass(icon_get(device.icon));
        $device.find('.control .name').html(device.name);

		if (!device.brightness) {
			$device.find('.slider.brightness').remove();
		}

        if (!device.color) {
            $device.find('.color').remove();   
        }

		$device_list.append($device);

		device_state_get(device, device_state_set);
	});
}

/* --------------------------------------------------------------------- TOGGLE --- */
function device_toggle() {
	$(document).on('change', '[type="checkbox"]', function() {
		var $device;
		var device,
			state;

		$device = $(this).closest('.device');
		device = {
			ip: JSON.parse($device.attr('data-device-ip')),
			mac: JSON.parse($device.attr('data-device-mac'))
		};
		device = device_get(device.mac);
		state = $(this).is(':checked') ? 'on' : 'off';

		device_switch(device, state);
	});
}

/* --------------------------------------------------------------------- SWITCH --- */
function device_switch(device, state) {
    var toggle_uri;

    toggle_uri = [];

	switch(device.type) {
		case 'orvibo' :
			toggle_uri.push('//' + DOMAIN + ':8001/' + device.mac + '/' + state);
			break;
		case 'bravia' :
			toggle_uri.push('//' + DOMAIN + ':8002/' + state);
			break;
		case 'yeelight' :
            $.each(device.ip, function(_, ip) {
                toggle_uri.push('//' + DOMAIN + ':8003/' + ip + '/' + state);
            });
			break;
	}

    $.each(toggle_uri, function(_, uri) {
        $.get(uri);
    });
}

/* ----------------------------------------------------------------- BRIGHTNESS --- */
function device_brightness() {
	$('.slider.brightness').on('change', '[type="range"]', function(event, human) {
		var $device;
		var device,
			value,
			percentage_uri;

        if (human === false) return;

		$device = $(this).closest('.device');
		device = {
			ip: JSON.parse($device.attr('data-device-ip')),
			mac: JSON.parse($device.attr('data-device-mac'))
		};
		device = device_get(device.mac);
		value = $(this).val();
        percentage_uri = [];

		switch(device.type) {
			case 'yeelight' :
                $.each(device.ip, function(_, ip) {
				    percentage_uri.push('//' + DOMAIN + ':8003/' + ip + '/percentage/' + value);
                });
				break;
		}

        $.each(percentage_uri, function(_, uri) {
            $.get(uri);
        });
	});
}

/* --------------------------------------------------------------------- SWATCH --- */
function device_swatch() {
    $('.swatch .color').on('tap', function() {
        var $device;
        var device,
            value,
            rgb_uri;

        $device = $(this).closest('.layer').data('device');
        device = {
            ip: JSON.parse($device.attr('data-device-ip')),
            mac: JSON.parse($device.attr('data-device-mac'))
        };
        device = device_get(device.mac);
        value = JSON.parse($(this).attr('data-color')).join(',');
        rgb_uri = [];

        switch(device.type) {
            case 'yeelight' :
                $.each(device.ip, function(_, ip) {
                    rgb_uri.push('//' + DOMAIN + ':8003/' + ip + '/rgb/' + value);
                });
                break;
        }

        $.each(rgb_uri, function(_, uri) {
            $.get(uri);
        });
    });
}

/* ------------------------------------------------------------------------ GET --- */
function device_get(device_mac) {
	var device;

	$.each(config.devices, function(_, _device) {
		if (JSON.stringify(device_mac) == JSON.stringify(_device.mac)) {
			device = _device;

			return;
		}
	});

	return device;
}

/* ------------------------------------------------------------------ STATE GET --- */
function device_state_get(device, callback) {
	var state_uri;

	switch(device.type) {
		case 'orvibo' :
			state_uri = '//' + DOMAIN + ':8001/' + device.mac + '/state';
			break;
		case 'bravia' :
			state_uri = '//' + DOMAIN + ':8002/state';
			break;
		case 'yeelight' :
            $.each(device.ip, function(_, ip) {
                state_uri = '//' + DOMAIN + ':8003/' + ip + '/state';
            });
			break;
	}

	$.ajax({
		url: state_uri,
		type: 'get',
		cache: false,
		success: callback
	});
}

/* ------------------------------------------------------------------ STATE SET --- */
function device_state_set(device) {
	var $device;
    var regex;

	if (typeof device.mac !== 'undefined') {
		regex = new RegExp(device.mac);
        $device = $('.device[data-device-mac]').filter(function() {
            return $(this).attr('data-device-mac').match(regex);
        });
	} else {
        regex = new RegExp(device.ip);
		$device = $('.device[data-device-ip]').filter(function() {
            return $(this).attr('data-device-ip').match(regex);
        });
	}

    if (device.state !== null) {
        $device.removeClass('disable');

        $device.find('[type="checkbox"]').prop('checked', device.state);
    }

	if (typeof device.percentage !== 'undefined' && device.percentage !== null) {
		$device.find('[type="range"]').val(device.percentage).trigger('change', false);
	}

    if (typeof device.rgb !== 'undefined' && device.rgb !== null) {
        $device.find('.control .color').css('background-color', 'rgb(' + device.rgb.join(',') + ')');
    }
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////// SCENE /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function scene_init() {
	scene_render();
	scene_activate();
}

/* --------------------------------------------------------------------- RENDER --- */
function scene_render() {
	var $scene_list;

	$scene_list = $('#scene .scene_list');

	$.each(config.scenes, function(_, scene) {
		var $scene;

		$scene = $scene_list.find('.scene.clone').clone(true, true).removeClass('clone');

		$scene.attr('data-scene-id', scene.id);
        $scene.find('.name').html(scene.name);

		$scene_list.append($scene);
	});
}

/* ------------------------------------------------------------------- ACTIVATE --- */
function scene_activate() {
	$('.scene_list').on('tap', '.scene .button', function() {
		var devices,
            scene_id,
			scene;

        devices = config.devices;
		scene_id = $(this).closest('.scene').attr('data-scene-id');
		scene = scene_get(scene_id);

        $.each(devices, function(_, device) {
            if ($.inArray(device.id, scene.devices) === -1) {
                device_switch(device, 'off');

                return;
            }

            device_switch(device, 'on');
        });
	});
}

/* ------------------------------------------------------------------------ GET --- */
function scene_get(scene_id) {
    var scene;

    $.each(config.scenes, function(_, _scene) {
        if (_scene.id == scene_id) {
            scene = _scene;

            return;
        }
    });

    return scene;
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* /////////////////////////////////////////////////////////////////////// ICON /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ------------------------------------------------------------------------ GET --- */
function icon_get(icon_id) {
	var name;

	$.each(config.icons, function(_, icon) {
		if (icon.id == icon_id) {
			name = icon.name;

			return;
		}
	});

	return name;
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////// RANGE /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function range_init() {
	$('input[type="range"]').rangeslider({ polyfill: false });
}


/* //////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////// PICKER /// */
/* //////////////////////////////////////////////////////////////////////////////// */

/* ----------------------------------------------------------------------- INIT --- */
function picker_init() {
    picker_color_render();

    picker_layer_toggle();
}

/* ---------------------------------------------------------------------- RESET --- */
function picker_reset() {}

/* --------------------------------------------------------------- COLOR RENDER --- */
function picker_color_render() {
    var $picker;

    $picker = $('.picker.color');
}

/* --------------------------------------------------------------- LAYER TOGGLE --- */
function picker_layer_toggle() {
    $('.device .control .color').on('tap', function() {
        var $layer,
            $device;

        $layer = $('.layer.color');
        $device = $(this).closest('.device');

        picker_reset();

        $layer.addClass('display');
        $layer.data('device', $device);
    });
}
