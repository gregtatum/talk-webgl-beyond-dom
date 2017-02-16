/**
 *  ATTRIBUTES
 *  SHADERS
 *  UNIFORM
 *  VARYING
 */
const regl = require('regl')()
const mat4 = require('gl-mat4')
const glsl = require('glslify')

const positions = generatePlane(100, 100)

const drawPlane = regl({

  vert: glsl`
    precision mediump float;
    attribute vec3 position;
    uniform mat4 view, projection;
    uniform float time;
    varying vec3 vPosition;

    void main() {
      vPosition = position;
      float sinTime = sin(time);
      vPosition.y += sin(10.0 * vPosition.x * sinTime + time) * 0.1;
      vPosition.y += sin(5.0 * vPosition.z * sinTime + time) * 0.1;
      vPosition.y += sin(40.0 * vPosition.z * sinTime + time * 3.0) * 0.1;
      vPosition.y += sin(30.5 * vPosition.x * sinTime + time * 3.5) * 0.1;
      vPosition.x *= 2.0;
      vPosition.z *= 2.0;

      gl_Position = projection * view * vec4(vPosition, 1);
    }
  `,

  frag: glsl`
    precision mediump float;
    varying vec3 vPosition;
    uniform float time;

    void main() {
      // vec4(red, green, blue, alpha)
      gl_FragColor = vec4(
        // red
        sin(time * 2.0 + vPosition.x),
        // green
        (1.0 - vPosition.y) - 0.5,
        // blue
        0.0,
        // alpha
        1.0
      );
    }
  `,

  // this converts the vertices of the mesh into the position attribute
  attributes: {
    position: positions,
  },
  count: positions.length,
  uniforms: {
    view: ({time}) => {
      const t = time * 0.4
      return mat4.lookAt([],
        [2 * Math.cos(t), 1.5, 2 * Math.sin(t)],
        [0, 0, 0],
        [0, 1, 0])
    },
    time: ({time}) => time,
    projection: ({viewportWidth, viewportHeight}) => (
      mat4.perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000)
      )
  }
})

function generatePlane (segmentsX, segmentsZ) {
  const positions = []
  const widthX = 1 / segmentsX
  const widthZ = 1 / segmentsZ
  for (let x = 0; x < segmentsX; x++) {
    for (let z = 0; z < segmentsZ; z++) {
      const x0 = x * widthX - 0.5
      const x1 = (x + 1) * widthX - 0.5
      const z0 = z * widthZ - 0.5
      const z1 = (z + 1) * widthZ - 0.5

      // Build 2 triangles
      //
      //       (x0, z1)       (x1, z1)
      //              *-------*
      //              | A   / |
      //              |   /   |
      //              | /   B |
      //              *-------*
      //       (x0, z0)       (x1, z0)

      // Triangle A
      positions.push([x0, 0, z0])
      positions.push([x0, 0, z1])
      positions.push([x1, 0, z1])

      // Triangle B
      positions.push([x1, 0, z1])
      positions.push([x1, 0, z0])
      positions.push([x0, 0, z0])
    }
  }
  return positions
}

// Run the draw code on every frame update at 60fps.
regl.frame(() => {
  regl.clear({ depth: 1, color: [0, 0, 0, 1] })
  drawPlane()
})
