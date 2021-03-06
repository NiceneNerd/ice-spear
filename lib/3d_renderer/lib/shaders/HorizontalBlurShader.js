/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"h":        { value: 1.0 / 512.0 }

	},

	vertexShader: [

		"out vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",

		"in vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
			"sum += texture( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

			"fragmentColor = sum;",

		"}"

	].join( "\n" )

};
