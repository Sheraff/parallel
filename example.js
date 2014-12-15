var parallel = new Parallel()
	.add(return_in.bind(undefined, 3))
	.done(function () {
		console.log("done");
	})
	.add(function (done) {
		var parallel = new Parallel()
			.done(function () {
				console.log("sub parallel done");
				done();
			})
			.add(return_in.bind(undefined, 3))
			.add(return_in.bind(undefined, 1));
	})
	.add(function (done) {
		parallel.add(return_in.bind(undefined, 3))
		parallel.add(return_in.bind(undefined, 1))
		done();
	})

function return_in (s, callback) {
	console.log("will return in "+s+"s")
	setTimeout(callback,s*1000);
}

function Parallel (){
	var all_fn = [];
	var open, done;
	this.add = function (parallelized) {
		all_fn.push(false);
		process.nextTick((function(index) {
			parallelized(callback.bind(this, index));
		}).bind(this, all_fn.length-1));
		return this;
	}
	this.done = function (fn) {
		done = fn;
		if(all_fn.length>0 && alldone()) done();
		else open = true;
		return this;
	}
	function callback (index) {
		all_fn[index] = true;
		if(open && alldone() && done){
			open = false;
			done();
		}
	}
	function alldone () {
		for (var i = all_fn.length - 1; i >= 0; i--) {
			if(!all_fn[i]) return false;
		};
		return true;
	}
	return this;
}