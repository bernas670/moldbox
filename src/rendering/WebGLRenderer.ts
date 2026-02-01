/**
 * WebGL2 renderer for RGB trail display.
 */
export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private width: number;
  private height: number;
  private trailTexture!: WebGLTexture;
  private program!: WebGLProgram;
  private quadVAO!: WebGLVertexArrayObject;
  private textureData: Uint8Array;

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.textureData = new Uint8Array(width * height * 4);

    this.initShaders();
    this.initBuffers();
    this.initTexture();
  }

  private initShaders(): void {
    const gl = this.gl;

    const vertSrc = `#version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      // Flip Y to match screen coordinates
      v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
    }`;

    const fragSrc = `#version 300 es
    precision highp float;
    in vec2 v_uv;
    uniform sampler2D u_trail;
    out vec4 fragColor;

    void main() {
      vec3 color = texture(u_trail, v_uv).rgb;
      // Add slight background tint
      vec3 bg = vec3(0.0, 0.02, 0.05);
      fragColor = vec4(bg + color, 1.0);
    }`;

    const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, vertSrc);
    gl.compileShader(vertShader);
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      throw new Error(`Vertex shader error: ${gl.getShaderInfoLog(vertShader)}`);
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, fragSrc);
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      throw new Error(`Fragment shader error: ${gl.getShaderInfoLog(fragShader)}`);
    }

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertShader);
    gl.attachShader(this.program, fragShader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(this.program)}`);
    }

    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
  }

  private initBuffers(): void {
    const gl = this.gl;

    const positions = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1,
    ]);

    this.quadVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.quadVAO);

    const posBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  private initTexture(): void {
    const gl = this.gl;

    this.trailTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.trailTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  /**
   * Upload RGB trail data to GPU and render
   * trailData is RGB interleaved: [r0, g0, b0, r1, g1, b1, ...]
   */
  render(trailData: Float32Array): void {
    const gl = this.gl;
    const pixelCount = this.width * this.height;

    // Convert RGB float data to RGBA bytes
    for (let i = 0; i < pixelCount; i++) {
      const srcIdx = i * 3;
      const dstIdx = i * 4;
      // Scale and clamp values
      this.textureData[dstIdx] = Math.min(255, Math.max(0, Math.floor(trailData[srcIdx] * 25)));
      this.textureData[dstIdx + 1] = Math.min(255, Math.max(0, Math.floor(trailData[srcIdx + 1] * 25)));
      this.textureData[dstIdx + 2] = Math.min(255, Math.max(0, Math.floor(trailData[srcIdx + 2] * 25)));
      this.textureData[dstIdx + 3] = 255;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.trailTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this.textureData);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.trailTexture);
    gl.uniform1i(gl.getUniformLocation(this.program, 'u_trail'), 0);

    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.textureData = new Uint8Array(width * height * 4);
    this.gl.deleteTexture(this.trailTexture);
    this.initTexture();
  }

  get currentWidth(): number { return this.width; }
  get currentHeight(): number { return this.height; }
}
