
/*Usage:

	var spline = new Spline({
		points: array_of_control_points,
		duration: time_in_miliseconds,
		sharpness: how_curvy,
		stepLength: distance_between_points_to_cache
	});

*/



export const spline = (options) => {


	let points = options.points || [];
	let duration = options.duration || 10000;
	let sharpness = options.sharpness || 0.85;
	let centers = [];
	let controls = [];
	let stepLength = options.stepLength || 60;
	let length = points.length;
	let delay = 0;

	// this is to ensure compatibility with the 2d version
	for (var i = 0; i < length; i++) points[i].z = points[i].z || 0;
	for (var i = 0; i < length - 1; i++) {
		var p1 = points[i];
		var p2 = points[i + 1];
		centers.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2 });
	}
	controls.push([points[0], points[0]]);
	for (var i = 0; i < centers.length - 1; i++) {
		var p1 = centers[i];
		var p2 = centers[i + 1];
		var dx = points[i + 1].x - (centers[i].x + centers[i + 1].x) / 2;
		var dy = points[i + 1].y - (centers[i].y + centers[i + 1].y) / 2;
		var dz = points[i + 1].z - (centers[i].y + centers[i + 1].z) / 2;
		controls.push([{
			x: (1.0 - sharpness) * points[i + 1].x + sharpness * (centers[i].x + dx),
			y: (1.0 - sharpness) * points[i + 1].y + sharpness * (centers[i].y + dy),
			z: (1.0 - sharpness) * points[i + 1].z + sharpness * (centers[i].z + dz)
		},
		{
			x: (1.0 - sharpness) * points[i + 1].x + sharpness * (centers[i + 1].x + dx),
			y: (1.0 - sharpness) * points[i + 1].y + sharpness * (centers[i + 1].y + dy),
			z: (1.0 - sharpness) * points[i + 1].z + sharpness * (centers[i + 1].z + dz)
		}]);
	}
	controls.push([points[length - 1], points[length - 1]]);

	return {points,duration,sharpness,centers,controls,stepLength,length,delay,pos,vector}

}

export const pos = ({sp,time}) => {	
	let {points,controls,duration,delay,length} = sp;
	const bezier = (t, p1, c1, c2, p2) => {
		var B = function (t) {
			var t2 = t * t, t3 = t2 * t;
			return [(t3), (3 * t2 * (1 - t)), (3 * t * (1 - t) * (1 - t)), ((1 - t) * (1 - t) * (1 - t))]
		}
		var b = B(t)
		var position = {
			x: p2.x * b[0] + c2.x * b[1] + c1.x * b[2] + p1.x * b[3],
			y: p2.y * b[0] + c2.y * b[1] + c1.y * b[2] + p1.y * b[3],
			z: p2.z * b[0] + c2.z * b[1] + c1.z * b[2] + p1.z * b[3]
		}
		return position;
	}
	var t = time - delay;
	if (t < 0) t = 0;
	if (t > duration) t = duration - 1;
	//t = t-delay;
	var t2 = (t) / duration;
	if (t2 >= 1) return points[length - 1];

	var n = Math.floor((points.length - 1) * t2);
	var t1 = (length - 1) * t2 - n;
	return bezier(t1, points[n], controls[n][1], controls[n + 1][0], points[n + 1]);
}

// export const cacheSteps = ({sp,mindist}) => {
// 	let {duration} = sp;
// 	var steps = [];
// 	var laststep = pos(0);
// 	steps.push(0);
// 	for (var t = 0; t < duration; t += 10) {
// 		var step = pos(t);
// 		var dist = Math.sqrt((step.x - laststep.x) * (step.x - laststep.x) + (step.y - laststep.y) * (step.y - laststep.y) + (step.z - laststep.z) * (step.z - laststep.z));
// 		if (dist > mindist) {
// 			steps.push(t);
// 			laststep = step;
// 		}
// 	}
// 	return steps;
// }

export const vector = ({sp,time}) => {
	let t = time;
	var p1 = pos({sp,time:t + 10});
	var p2 = pos({sp, time:t - 10});
	return {
		angle: 180 * Math.atan2(p1.y - p2.y, p1.x - p2.x) / Math.PI,
		speed: Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y) + (p2.z - p1.z) * (p2.z - p1.z))
	}
}





