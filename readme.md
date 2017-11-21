Given a glob pattern of input CSS files, outputs a single file with that concatenates all of the outputs together in a mostly-deterministic fashion (the deeper in the directory structure the file is, the farther down in the output file the CSS goes).

The main postcss-cli library doesn't do this, it only transforms multiple input files into multiple output files.

# Usage

This app resolves postcss.config.js files the same way the as the regular postcss-cli.

```sh
postcss-alt "client/routes/**/*.css" "public/style.css"

# To specify a different config file
postcss-alt "client/routes/**/*.css" "public/style.css" --config="some/config.js"

# in development:
postcss-alt "client/routes/**/*.css" "public/style.css" --watch

# to specify a different glob for watching
postcss-alt "client/routes/**/*.css" "public/style.css" --watch="client/**/*.css"
```

# Note

Don't start glob patterns with `./` or watching won't work.  It's an [issue in `gaze`](https://github.com/shama/gaze/issues/167).

# License

[WTFPL](http://wtfpl2.com)

