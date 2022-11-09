import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ShaderService } from '../shader.service';

@Component({
  selector: 'app-scene-canvas',
  templateUrl: './scene-canvas.component.html',
  styleUrls: ['./scene-canvas.component.css']
})
export class SceneCanvasComponent implements OnInit {
  @ViewChild('glCanvas') public canvas!: ElementRef
  didInit: boolean = false
  buffers: any

  c = 0.3
  dt = 1.0 / 30

  position?: {x: number, y: number}
  velocity: {x: number, y: number} =  {x: 0, y: 0}
  acceleration: {x: number, y: number} =  {x: 0, y: 0}

  positions: number[] = []
  velocities: number[] = []
  accelerations: number[] = []

  constructor(private shaderService: ShaderService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.shaderService.getShaders().then(() => {
      this.didInit = true
      this.main()
    })

    window.addEventListener('pointermove', (event) => {
      this.onMouseMove(event)
    })
  }

  onMouseMove(event: any) {
    const x = event.x / window.innerWidth * 2
    const y = (1 - event.y / window.innerHeight) * 2
    if (this.position == undefined) {
      this.position = {
        x: x,
        y: y
      }
    }
    this.position.x = x
    this.position.y = y
  }

  main() {
    const gl = this.canvas.nativeElement.getContext("webgl2")
    this.shaderService.gl = gl
    gl.getExtension("EXT_color_buffer_float")
    if (gl === null) {
      console.error("Unable to initialize WebGL")
      alert("Unable to initialize WebGL. Your browser or machine may not support it.")
      return
    }
    this.buffers = this.initBuffers(gl)
    const shaderProgram = this.shaderService.initShaderProgram(gl, this.shaderService.vertexSource, this.shaderService.fragmentSource)
    const programInfo = {
      program: shaderProgram,
      uniformLocations: {
        width: gl.getUniformLocation(shaderProgram, 'width'),
        height: gl.getUniformLocation(shaderProgram, 'height'),
        c: gl.getUniformLocation(shaderProgram, 'c'),
        dt: gl.getUniformLocation(shaderProgram, 'dt'),
        positions: gl.getUniformLocation(shaderProgram, 'positions'),
        velocities: gl.getUniformLocation(shaderProgram, 'velocities'),
        accelerations: gl.getUniformLocation(shaderProgram, 'accelerations'),
        positionCount: gl.getUniformLocation(shaderProgram, 'positionCount'),
        velocityCount: gl.getUniformLocation(shaderProgram, 'velocityCount'),
        accelerationCount: gl.getUniformLocation(shaderProgram, 'accelerationCount'),
      },
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'i_VertexPosition')
      }
    }
    const resizeCanvas = () => {
      this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth
      this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      if (this.positions.length > 0) {
        this.drawScene(gl, programInfo)
      }
    }
    resizeCanvas()

    var time = new Date().getTime()
    var t = 0
    var render = () => {
      if ((new Date().getTime() - time) / 1000 < this.dt) {
        requestAnimationFrame(render)
        return;
      }
      time = new Date().getTime()
      
      if (this.positions.length > 0) {
        this.drawScene(gl, programInfo)
      }
      const f = 10
      this.position = {
        x: .0 * Math.cos(2 * Math.PI * f * t) + 1,
        y: .005 * Math.sin(2 * Math.PI * f * t) + 1
      }
      t += this.dt
      // this.position = {
      //   x: 1,
      //   y: Math.floor(Math.min(0.4*t, 1)) * 2
      // }
      if (this.position != undefined) {
        var n = this.positions.length
        if (n >= 2) {
          var dx = this.position.x - this.positions[n - 2]
          var dy = this.position.y - this.positions[n - 1]
          this.velocity.x = dx / this.dt
          this.velocity.y = dy / this.dt
          if (n >= 3) {
            var dvx = this.velocity.x - this.velocities[n - 2]
            var dvy = this.velocity.y - this.velocities[n - 1]
            this.acceleration.x = dvx / this.dt
            this.acceleration.y = dvy / this.dt
          }
        }
        this.positions.push(this.position.x)
        this.positions.push(this.position.y)
        
        this.velocities.push(this.velocity.x)
        this.velocities.push(this.velocity.y)
        this.accelerations.push(this.acceleration.x)
        this.accelerations.push(this.acceleration.y)
        
        this.positions = this.positions.slice(-600)
        this.velocities = this.velocities.slice(-600)
        this.accelerations = this.accelerations.slice(-600)
        
        // console.log(this.velocities[this.velocities.length - 1])
      }
      requestAnimationFrame(render)
    }
    render()
  }

  initBuffers(gl: WebGL2RenderingContext) {
    var positions: number[] = 
    [1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
      -1.0, -1.0]
    const corners = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, corners)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return {
      corners: corners
    }
  }

  drawScene(gl: WebGL2RenderingContext, programInfo: any) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(programInfo.program)
    gl.uniform1f(programInfo.uniformLocations.width, gl.canvas.width)
    gl.uniform1f(programInfo.uniformLocations.height, gl.canvas.height)
    gl.uniform1f(programInfo.uniformLocations.c, this.c)
    gl.uniform1f(programInfo.uniformLocations.dt, this.dt)
    gl.uniform2fv(programInfo.uniformLocations.positions, this.positions)
    gl.uniform2fv(programInfo.uniformLocations.velocities, this.velocities)
    gl.uniform2fv(programInfo.uniformLocations.accelerations, this.accelerations)
    gl.uniform1i(programInfo.uniformLocations.positionCount, this.positions.length / 2)
    gl.uniform1i(programInfo.uniformLocations.velocityCount, this.velocities.length / 2)
    gl.uniform1i(programInfo.uniformLocations.accelerationCount, this.accelerations.length / 2)
    {
      const numComponents = 2
      const type = gl.FLOAT
      const normalize = false
      const stride = 0
      const offset = 0
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.corners)
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset)
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
