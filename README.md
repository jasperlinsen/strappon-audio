strappon-audio
==============

##Introduction

The Strappon Audio plugin allows easy, cross-platform web audio performance. For maximum compatibility it is best to initiate the audio API after the user has clicked a button, assuring that audio will be available on mobile devices as well.

##Usage

###Including the API in your page

Including the API into your page is as easy as loading it in a script tag. You can do this anywhere but it is recommended to do so on in the`<head>`tag.

`
<script type="text/javascript" src="folder/structure/strappon.audio.js"></script>
`
As long as you initialise your audio after including this file, it will work. Initialising your audio is as easy as calling a new `sound ()` object and passing it some parameters. By default debugging is on, but if you turn debug on you will see instructions on how to work with the API. You can always call the `help()`function to get more info on any of the API functions, or use this document as reference.

`
<script type="text/javascript">
	var _audio = new sound({
url:"folder/structure/file.wav",
debug:true,
instances : {
	"instanceName" : { "start" : 0, "duration" : 2 },
}
	});
</script>
`
By turning debug on initialisation, debugging will report a lot of things that are going on. This will only work on browsers with a *console</span>, and it will throw an alert on browser that don't support *console.log</span>.

There are three major ways in which you can play audio: play, loop and consecutive. 
`Play` will simply play the audio and stop after the first play. You can pull it as often as you want and is useful for pulling at certain events. 
`Loop` will loop the audio until either another sound is played using play, loop or consecutive, or until `stop()` is called. 
`Consecutive` allows stacking of audio one after the other. This allows you to create a chain that ends in a loop by passing an array that either contains strings (every string will be played in order), or arrays (where the first element is the instance and the second is either play or loop). Once a loop element is found, it will stop executing the consecutive function.

`
<script type="text/javascript">
	_audio.play("instanceName");
	_audio.loop("instanceName");
	_audio.consecutive([
"instanceName",
["instanceName","play"],
["instanceName","loop"]
	]);
</script>
`

Any audio events fired before the file is ready will be stacked and played consecutively as soon as the file is loaded in. You can check whether the file is ready by polling the `ready` variable. You can also redefine the `onready` as a function to be pulled when ready by passing a `{ready : function(){}` function on initialisation.

##API

###fn.INIT

	`var.init($url,$instances)` 
	Initialise audio.
	`$url` {STR} Location of file.
	`$instances` {OBJ: {$name : {$start, $duration}}}: Object containing named objects with a start and duration (floats).
###fn.TRACK

	`var.track($url)`
	Initialise audio file.
	`$url` {STR} Location of file.
###fn.ADD

	`var.add($name,$start,$duration)`
	Add instance of audio.
	`$name` {STR} Name of this instance.
	`$start` {INT/FLOAT}: Point in track where instance starts (seconds).
	`$duration` {INT/FLOAT}: Length of instance.
###fn.PLAY

	`var.play($instance)`
	Play instance.
	`$instance` {STR} Name of instance to be played.
###fn.STOP

	`var.stop()`
	Stop audio.
###fn.LOOP

	`var.loop($instance)`
	Loop instance.
	`$instance` {STR} Name of instance to be looped.
###fn.CONSECUTIVE

	`var.consecutive($instances)`
	Play instances consecutively.
	`$instances` {ARRAY} Array consisting of either strings (to play one after the other), or other arrays ([$instance, $type]).
	`$instance` {STR} : Name of instance.
	`$type` {STR} : Play type (loop or play).