/******************************************************
strappon.audio.js
	started on 27/04/2014
	started by Jasper Linsen
******************************************************/

function sound(object){
	var url = object.url ? object.url : false;
	var instances = object.instances ? object.instances : false;
	var debug = object.debug ? object.debug : false;
	var ready = object.ready ? object.ready : false;
	this.init(url,instances,debug,ready);
}
sound.prototype = {
	context : false,
	buffer : null,
	instances : {},
	source : null,
	element : null,
	timeout : null,
	muteValue : false,
	mute : function(a){
		if(a === undefined) return this.muteValue;
		else if(a === false || a === true) this.muteValue = a;
		else this.debug("fn.MUTE variable passed is not a boolean");
	},
	playing : false,
	ready : false,
	onready : [],
	debugValue : false,
	debug : function(a){
		if(a === undefined) return this.debugValue;
		else if(a === false || a === true) this.debugValue = a;
		else if(this.debug() && console) console.log(a);
		else if(this.debug()) throw(a);
	},
	notready : function(id,type){
		var local = this;
		if(typeof local.onready === "function"){
			local.debug("fn.NOTREADY: Audio not ready yet. Onready function will be triggered as soon as ready.");
		} else {
			local.debug("fn.NOTREADY: Audio not ready yet. Queued to " + type + " as soon as ready.");
			if(local.onready.length && local.onready[local.onready.length - 1].length >= 2 && local.onready[local.onready.length - 1][1] === "loop"){
				local.debug("fn.NOTREADY: Audio not ready yet. Cannot " + type + " as previously added item is a loop.");
			} else {
				local.onready.push([id,type]);
			}
		}
		return;
	},
	help : function(fn){
		if(console){ 
			var functions = {
				init : "INIT\nvar.init($url,$instances). Initialise audio.\n   $url {STR} Location of file.\n   $instances {OBJ: {$name : {$start, $duration}}}: Object containing named objects with a start and duration (floats).\n  ",
				track : "TRACK\nvar.track($url). Initialise audio file.\n   $url {STR} Location of file.\n  ",
				add : "ADD\nvar.add($name,$start,$duration). Add instance of audio.\n   $name {STR} Name of this instance.\n   $start {FLOAT}: Point in track where instance starts (seconds).\n   $duration {FLOAT}: Length of instance.\n  ",
				play : "PLAY\nvar.play($instance). Play instance.\n   $instance {STR} Name of instance to be played.\n  ",
				stop : "STOP\nvar.stop(). Stop audio.\n  ",
				loop : "LOOP\nvar.loop($instance). Loop instance.\n   $instance {STR} Name of instance to be looped.\n  ",
				consecutive : "CONSECUTIVE\nvar.consecutive($instances). Play instances consecutively.\n   $instances {ARRAY} Array consisting of either strings (to play one after the other), or other arrays ([$instance, $type]).\n       $instance {STR} : Name of instance.\n       $type {STR} : Play type (loop or play).\n  "
			}
			console.log("------------    HELP   ------------- \n  ");
			if(fn && functions[fn]) console.log(functions[fn]);
			else {
				for(i in functions) console.log(functions[i]);
			}
			console.log("------------- END HELP -------------");
		}
		else alert("fn.HELP: Help is available on browsers with a console.");
	},
	init : function(url,instances,debug,ready){
		if(debug) this.debug(true);
		if(url) this.track(url);
		else this.debug("fn.INIT: No URL passed on init. Add one with 'var.track(url)'.");
		if(instances){
			for(var i in instances){
				this.add(i, instances[i]["start"], instances[i]["duration"]);
			}
 		}
 		else this.debug("fn.INIT: No instances passed on init. Add one with 'var.add(name,start,duration)'.");
 		if(typeof ready === "function") this.onready = ready;
	},
	track : function(url){
		if(!url){
			debug("fn.TRACK: No file url passed.");
			return;
		}
		var local = this;
		try {
			var request = new XMLHttpRequest();
  			request.open('GET', url, true);
  			request.responseType = 'arraybuffer';
  		
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			local.context = new AudioContext();
		
  			// Decode asynchronously
 			request.onload = function(){
				local.context.decodeAudioData(request.response, function(buffer) {
					local.buffer = buffer;
					// connect to the buffer so the first noteOff doesnt error
					local.source = local.context.createBufferSource();
					local.source.buffer = local.buffer;
					local.source.connect(local.context.destination);
					local.ready = true;
					local.debug("fn.TRACK: Audio file ready for use.");
					if(typeof local.onready === "function") local.onready();
					else local.consecutive(local.onready);
				}, function(){});
 			};
 			request.send();
 			local.element = new Audio(url);
 			local.element.load();
 		} catch(e){
 			local.debug("fn.TRACK: Audio is not supported on your device. See message below.");
 			local.debug(e);
 		}
	},
	add : function(name,start,duration){
		var local = this;
		if(!name){
			local.debug("fn.ADD: No instance name passed.");
			return;
		}
		if(!start && start !== 0){
			local.debug("fn.ADD: No instance start point passed.");
			return;
		}
		if(!duration){
			local.debug("fn.ADD: No instance duration passed.");
			return;
		}
		if(local.instances[name] != undefined){
			var i = local.instances[name];
			local.debug("fn.ADD: Instance '" + name + "' already existed (start: " + i["start"] + ", duration:" + i["duration"] + "). Instance overwritten.");
		}
		local.instances[name] = {
 			"start" : start,
 			"duration" : duration
 		};
	},
	play : function(instance){
		var local = this;
		local.debug("fn.PLAY: Trying to play '" + instance + "'...");
		if(!local.ready){
			local.notready(instance,"play");
			return;
		}
		if(local.mute()){
			local.debug("fn.PLAY: Audio is muted (will not play)");
			return;
		}
		if(!instance){
			local.debug("fn.PLAY: No instance passed to play option.");
			return;
		} else {
			success = this.instances[instance] != undefined
			? this.instances[instance]
			: false;
			if(!success){
				local.debug("fn.PLAY instance was not found.")	;
				return;
			}
		}
		local.playing = true;
		var start = success["start"], 
			stop = success["duration"];
		try {
			local.source = local.context.createBufferSource();
			local.source.buffer = local.buffer;
			local.source.connect(local.context.destination);
			local.source.start(0,start,stop);
		} catch(e) {
			local.debug("fn.PLAY: Error playing type 1 audio, trying type 2. Error below.");
			local.debug(e);
			try {
				clearTimeout(this.timeout);
				local.element.pause();
				local.element.currentTime = start;
				local.element.play();
				this.timeout = setTimeout(function(){
					local.element.pause();
				}, 1000 * stop);
			} catch(e){
				// silently fail here
				local.debug("fn.PLAY: Error playing type 2 audio. Giving up. Error below.");
				local.debug(e);
			}
		}
	},
	stop : function(){
		var local = this;
		local.debug("fn.STOP Stopping all audio.");
		try {
			local.source.stop();
		} catch(e){
			try {
				local.element.pause();
			} catch(e){}
		}
		local.playing = false;
		clearInterval(local.looping);
		local.looping = false;
		clearTimeout(local.consecutiveTimeout);
		local.consecutiveTimeout = false;
	},
	looping : false,
	loop : function(instance){
		var local = this;
		if(!local.ready){
			local.notready(instance,"loop");
			return;
		}
		local.debug("fn.LOOP Looping instance '" + instance + "'.");
		if(instance && local.instances[instance] != undefined){
			local.stop();
			local.play(instance);
			local.looping = setInterval(function(){
				local.play(instance);
			}, local.instances[instance].duration * 1000);
		} else {
			clearInterval(local.looping);
			local.looping = false;
		}
	},
	consecutiveTimeout : false,
	consecutive : function(order, current){
		var local = this;
		clearTimeout(local.consecutiveTimeout);
		local.consecutiveTimeout = false;
		if(typeof order === "object"){
			current = current || 0;
			var id = false;
			var action = "play";
			var pause = 0;
		// if the value is an array of [id,loop?,pause]
			if(typeof order[current] === "object"){
		// if the first value in the array is there and its a known instance, set it
				if(order[current].length >= 1 && local.instances[order[current][0]] != undefined){
					id = order[current][0];
					pause = local.instances[order[current][0]].stop * 1000;
				}
		// if the second variable is a string and the action exists and is a function, apply the action
				if(
					order[current].length >= 2 
					&& typeof order[current][1] === "string" 
					&& typeof local[order[current][1]] === "function"
				){
					action = order[current][1];
				} else {
					local.debug("fn.CONSECUTIVE Action does not exists " + order[current][1]);
				}
				if(
					order[current].length >= 3 
					&& parseInt(local.instances[order[current][2]]) != "NaN"
				){
					id = order[current][0];
					pause += local.instances[order[current][2]];
				}
			} else if(typeof order[current] === "string"){
				if(local.instances[order[current]] != undefined)
					id = order[current][0];
			} else {
				local.debug("fn.CONSECUTIVE: Nothing defined in action");
				return;
			}
			local[action](id);
			local.debug("fn.CONSECUTIVE: executing '" + action + "' with id '" + id + "'");
			current++;
			if(order[current] != undefined && action !== "loop"){
				local.consecutiveTimeout = setTimeout(function(){
					local.consecutive(order,current);
				}, pause);
			}
		} else {
			local.debug("fn.CONSECUTIVE: Object passed to audio.consecutive is not an array of arrays. (type is " + typeof order + ")");
		}
	}
};