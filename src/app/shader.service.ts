import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShaderService {
  vertexSource = ""
  fragmentSource = ""
  gl!: WebGL2RenderingContext
  didInit = false

  constructor(private http: HttpClient) {
  }

  public async getShaders() {
    this.vertexSource = await firstValueFrom(this.http.get("shaders/vertex.glsl", {responseType: 'text'}))
    this.fragmentSource = await firstValueFrom(this.http.get("shaders/fragment.glsl", {responseType: 'text'}))
    this.didInit = true
  }

  public initShaderProgram(gl: any, vsSource: string, fsSource: string, transform_feedback_varyings: string[] | null = null): any {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vertexShader || !fragmentShader) {
      return null
    }

    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    if (transform_feedback_varyings != null) {
      gl.transformFeedbackVaryings(
        shaderProgram,
        transform_feedback_varyings,
        gl.INTERLEAVED_ATTRIBS)
    }  
    gl.linkProgram(shaderProgram) 

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
      // alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
      return null
    }

    return shaderProgram
  }

  public loadShader(gl: any, type: any, source: string): any {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
      // alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  public textureFromPixelArray(gl: WebGL2RenderingContext, dataArray: number[], type: any, width: number, height: number) {
    var dataTypedArray = new Float32Array(dataArray);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, type, gl.FLOAT, dataTypedArray);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // var dataTypedArray = new Uint8Array(dataArray);
    // var texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, type, gl.UNSIGNED_BYTE, dataTypedArray);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return texture;
  }
}
