const gulp = require("gulp");
const plumber = require("gulp-plumber");

gulp.srcPlumber = function (...args) {
	return gulp.src(...args)
		.pipe(plumber());
}

const moduleCache = {};
function requireCache(moduleName) {
	if (!(moduleName in moduleCache)) {
		moduleCache[moduleName] = require(moduleName);
	}
	return moduleCache[moduleName];
}

let project;
gulp.task("ts", cb => {
	const typescript = requireCache("gulp-typescript");
	if (!project) project = typescript.createProject("tsconfig.json", {
		declaration: false,
		isolatedModules: true
	});
	project.src()
		.pipe(plumber())
		.pipe(project(typescript.reporter.fullReporter(true))).js
		.pipe(gulp.dest("out"))
		.on("finish", cb);
});

gulp.task("mocha", () => {
	const mocha = requireCache("gulp-mocha");
	gulp.src("out/TestMagic.js", { read: false })
		.pipe(mocha({ reporter: "nyan" }));
});

gulp.task("watch", () => {
	const runSequence = requireCache("run-sequence");
	const update = () => runSequence("ts", "mocha");
	update();
	gulp.watch("./src/**/*.ts", update);
});