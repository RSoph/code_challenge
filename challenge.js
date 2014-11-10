var world_data = require('sample.json')
var user_data = require('user.json')

// this function takes two sets of coordinates and returns the
// distance between them in meters
function measure(world_x, world_y, user_x, user_y){ 
  var R = 6378.137;
  var dLat = (user_x - world_x) * Math.PI / 180;
  var dLon = (user_y - world_y) * Math.PI / 180;
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(world_x * Math.PI / 180) * Math.cos(user_x * Math.PI / 180) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
 	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d * 1000;
}

// this function takes a date-time in string form, as provided
// in the JSON data, and returns a correposponding Date object
function convert_time(string_time){
	var year = string_time.substring(0,4)
	var month = string_time.substring(5,7) - 1
	var day = string_time.substring(8,10)
	var hour = string_time.substring(11,13)
	var minute = string_time.substring(14,16)
	var second = string_time.substring(17,19)
	var milisecond = string_time.substring(20,23)
	var new_time = new Date(year, month, day, hour, minute, second, milisecond)
	return new_time
}

// this function takes a world's start and end times, and a user time
// and returns a boolean reflecting whether the usertime is within the
// world's time range
function time(time_start, time_end, user_time){
	return(time_start < user_time && user_time < time_end)
}

// this function compares two arrays, and returns the number of 
// elements that are common between them. If an array contains duplicates
// they are not counted unless they are also duplicated in the other array
function compare(first_array, second_array){
	var counter = 0;
	first_array = first_array.sort();
	second_array = second_array.sort();
	while (first_array.length > 0 && second_array.length > 0) {
		if (first_array[0] === second_array [0]){
			first_array = first_array.slice(1);
			second_array = second_array.slice(1);
			counter++;
		}
		else if (first_array[0] < second_array[0]){
			first_array = first_array.slice(1);
		}else{
			second_array = second_array.slice(1);
		};
	};
	return counter;
}

var worlds_user_is_in = []
var user_x = user_data.user.userloc.coordinates[0]
var user_y = user_data.user.userloc.coordinates[1]
var user_time = convert_time(user_data.user.usertime)

// for each world, we establish the distance between the center of the
// world and the user's location. We also convert the time(s) to Date objects.
// Then we can determine if the user is in the world by verifying that 
// the distance is less than the world's radius, and the time is within the range.
for (var i = 0; i < world_data.data.length; i++) {
	var world_radius = world_data.data[i].radius
	var world_x = world_data.data[i].loc.coordinates[0]
	var world_y = world_data.data[i].loc.coordinates[1]
	var distance = measure(world_x, world_y, user_x, user_y)
	var time_start = world_data.data[i].time.timestart || "1000-01-01T00:00:01"
	var time_end = world_data.data[i].time.timeend || "3000-12-31T23:59:59"
	
	time_start = convert_time(time_start)
	time_end = convert_time(time_end)

	if (distance <= world_radius && time(time_start, time_end, user_time)) {
		var world_object = { 
												name : world_data.data[i].name, 
												tags : world_data.data[i].tags 
											}
		worlds_user_is_in[worlds_user_is_in.length] = world_object;
	}
}

// using the subset of worlds, we check how many tags are common 
// to the user for each world, using the compare function defined above

var ranks_array = []
var user_tags = user_data.user.tags

for (var i = 0; i < worlds_user_is_in.length; i++){
	var world_tags = worlds_user_is_in[i].tags;
	var world_name = worlds_user_is_in[i].name;
	var object_commonalities = { name : world_name,
															 in_common : compare(world_tags, user_tags)
															};
	ranks_array[ranks_array.length] = object_commonalities;
};

// the ranks array now contains a series of objects of the form:
// { name: 'World 7', in_common: 2 }
// these must be sorted by the in_common values:

ranks_array = ranks_array.sort(function(a, b) {
    return a.in_common - b.in_common;
}).reverse();

console.log(ranks_array)