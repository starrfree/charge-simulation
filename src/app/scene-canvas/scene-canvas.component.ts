import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ParametersService } from '../parameters.service';
import { ShaderService } from '../shader.service';

declare function getPosition(t: number, expressionX: string, expressionY: string): {x: number, y: number};

@Component({
  selector: 'app-scene-canvas',
  templateUrl: './scene-canvas.component.html',
  styleUrls: ['./scene-canvas.component.css']
})
export class SceneCanvasComponent implements OnInit {
  @ViewChild('glCanvas') public canvas!: ElementRef
  @Output() colorAtPointer = new EventEmitter<{r: number, g: number, b: number}>()
  @Input() isFullScreen = false
  didInit: boolean = false
  buffers: any
  textures: any
  resolution: number = 1.0 / 2.3

  c = 2
  dt = 1.0 / 50
  pointerPosition?: {x: number, y: number}
  targetPointerPosition?: {x: number, y: number}
  get pointerIndicatorPosition(): {x: string, y: string} {
    return {
      x: `${(this.pointerPosition?.x ?? -10) - 1}px`,
      y: `${(this.pointerPosition?.y ?? -10) - 1}px`
    }
  }

  position?: {x: number, y: number}
  velocity: {x: number, y: number} =  {x: 0, y: 0}
  acceleration: {x: number, y: number} =  {x: 0, y: 0}

  positions: number[] = []
  velocities: number[] = []
  accelerations: number[] = []

  public get center() : {x: number, y: number} {
    const size = Math.min(window.innerWidth, window.innerHeight)
    return {
      x: window.innerWidth / size * 4 / 2,
      y: window.innerHeight / size * 4 / 2
    }
  }
  
  constructor(private shaderService: ShaderService, private parametersService: ParametersService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.shaderService.getShaders().then(() => {
      this.didInit = true
      this.main()
    })

    this.canvas.nativeElement.addEventListener('pointermove', (event: any) => {
      this.onMouseMove(event)
    })
    this.canvas.nativeElement.addEventListener('pointerdown', (event: any) => {
      this.onMouseMove(event)
    })
    this.canvas.nativeElement.addEventListener('touchstart', (event: any) => {
      event.preventDefault()
      this.onMouseMove(event)
      event.stopPropagation()
    }, false)
    this.canvas.nativeElement.addEventListener('touchmove', (event: any) => {
      event.preventDefault()
      this.onMouseMove(event)
      event.stopPropagation()
    }, false)
  }

  onMouseMove(event: any) {
    var x: number
    var y: number
    if (event.touches) {
      x = event.touches[0].clientX
      y = event.touches[0].clientY
    } else {
      x = event.x
      y = event.y
    }
    if (this.pointerPosition == undefined) { this.pointerPosition = {x: x, y: y} }
    if (this.targetPointerPosition == undefined) { this.targetPointerPosition = {x: x, y: y} }
    this.targetPointerPosition.x = x
    this.targetPointerPosition.y = this.canvas.nativeElement.clientHeight - y
  }

  main() {
    const gl = this.canvas.nativeElement.getContext("webgl2")
    this.shaderService.gl = gl
    var ext = gl.getExtension("EXT_color_buffer_float")
    gl.getExtension("OES_texture_float_linear")
    if (gl === null) {
      console.error("Unable to initialize WebGL")
      alert("Unable to initialize WebGL. Your browser or machine may not support it.")
      return
    }
    if (!ext) {
      console.error("Unable to get EXT_color_buffer_float")
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
        pointerPosition: gl.getUniformLocation(shaderProgram, 'pointerPosition'),
        electric: gl.getUniformLocation(shaderProgram, 'electric'),
      },
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'i_VertexPosition')
      }
    }
    const resizeCanvas = () => {
      this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth * this.resolution
      this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight * this.resolution
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      this.positions = []
      this.velocities = []
      this.accelerations = []
      this.position = undefined
      this.velocity = {x: 0, y: 0}
      this.acceleration = {x: 0, y: 0}
      if (this.positions.length > 0) {
        this.drawScene(gl, programInfo)
      }
    }
    resizeCanvas()
    window.addEventListener('resize', () => {
      resizeCanvas()
    })

    var time = new Date().getTime()
    var t = 0
    const reset = () => {
      t = 0
      time = new Date().getTime()
      this.positions = []
      this.velocities = []
      this.accelerations = []
      this.position = undefined
      this.velocity = {x: 0, y: 0}
      this.acceleration = {x: 0, y: 0}
    }
    this.parametersService.resetSimulation = reset
    window.addEventListener('keypress', (event) => {
      if (event.key == 'r') {
        reset()
      }
    })
    var render = () => {
      if ((new Date().getTime() - time) / 1000 < this.dt) {
        requestAnimationFrame(render)
        return;
      }
      time = new Date().getTime()

      
      if (this.pointerPosition != undefined && this.targetPointerPosition != undefined) {
        let pointerSmooth = 10 * this.dt
        this.pointerPosition.x = pointerSmooth * this.targetPointerPosition.x + (1 - pointerSmooth) * this.pointerPosition.x
        this.pointerPosition.y = pointerSmooth * this.targetPointerPosition.y + (1 - pointerSmooth) * this.pointerPosition.y
      }
      
      this.position = this.getPosition(t)
      t += this.dt
      if (this.position != undefined) {
        if (this.positions.length >= 2) {
          var dx = this.position.x - this.positions[this.positions.length - 2]
          var dy = this.position.y - this.positions[this.positions.length - 1]
          this.velocity.x = dx / this.dt
          this.velocity.y = dy / this.dt
          if (this.velocities.length >= 2) {
            var dvx = this.velocity.x - this.velocities[this.velocities.length - 2]
            var dvy = this.velocity.y - this.velocities[this.velocities.length - 1]
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
        
        while (this.positions.length > 550) {
          this.positions.shift()
          this.velocities.shift()
          this.accelerations.shift()
        }

        this.textures = this.initTextures(gl)
      }
      requestAnimationFrame(render)
      if (this.positions.length > 0) {
        this.drawScene(gl, programInfo)
      }
      
      if (this.pointerPosition) {
        const pixels = new Uint8Array(4)
        gl.readPixels(this.pointerPosition.x * this.resolution, this.pointerPosition.y * this.resolution, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        this.colorAtPointer.emit({
          r: pixels[0] / 255,
          g: pixels[1] / 255,
          b: pixels[2] / 255
        })
      }
    }
    render()
  }

  getPosition(t: number) {
    if (this.parametersService.parameters.preset == 'follow') {
      if (this.pointerPosition == undefined) {
        return this.center
      }
      let lastPosition = this.positions.length >= 2 ? {
        x: this.positions[this.positions.length - 2],
        y: this.positions[this.positions.length - 1]
      } : this.center
      let size = Math.min(window.innerWidth, window.innerHeight)
      let targetPosition = {
        x: this.pointerPosition.x / size * 4,
        y: this.pointerPosition.y / size * 4
      }
      let maxSpeed = 0.022
      let dx = targetPosition.x - lastPosition.x
      let dy = targetPosition.y - lastPosition.y
      let distance = Math.sqrt(dx * dx + dy * dy)
      let speed = distance
      if (distance < 0.001) {
        return lastPosition
      }
      let lastVelocity = this.velocities.length >= 2 ? {
        x: this.velocities[this.velocities.length - 2],
        y: this.velocities[this.velocities.length - 1]
      } : {x: 0, y: 0}
      let lastSpeed = Math.sqrt(lastVelocity.x * lastVelocity.x + lastVelocity.y * lastVelocity.y)
      let speedSmooth = 0.01
      speed = speedSmooth * speed + (1 - speedSmooth) * lastSpeed
      speed = speed * (distance + 0.02)
      speed = (1 - 1 / (speed * 20 + 1)) * maxSpeed
      let x = lastPosition.x + speed * dx / distance
      let y = lastPosition.y + speed * dy / distance
      return {x: x, y: y}
    }
    var position = getPosition(t, this.parametersService.parameters.expressionX, this.parametersService.parameters.expressionY)
    position = {
      x: position.x + this.center.x,
      y: position.y + this.center.y
    }
    return position
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

  initTextures(gl: WebGL2RenderingContext) {
    var positionTexture = this.shaderService.textureFromPixelArray(gl, this.positions, gl.RG, this.positions.length / 2, 1)
    var velocityTexture = this.shaderService.textureFromPixelArray(gl, this.velocities, gl.RG, this.velocities.length / 2, 1)
    var accelerationTexture = this.shaderService.textureFromPixelArray(gl, this.accelerations, gl.RG, this.accelerations.length / 2, 1)
    return {
      positions: positionTexture,
      velocities: velocityTexture,
      accelerations: accelerationTexture
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
    gl.uniform1i(programInfo.uniformLocations.positionCount, this.positions.length / 2)
    gl.uniform1i(programInfo.uniformLocations.velocityCount, this.velocities.length / 2)
    gl.uniform1i(programInfo.uniformLocations.accelerationCount, this.accelerations.length / 2)
    gl.uniform1i(programInfo.uniformLocations.electric, this.parametersService.parameters.field == 'electric' ? 1 : 0)

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.positions);
    gl.uniform1i(programInfo.uniformLocations.positions, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.velocities);
    gl.uniform1i(programInfo.uniformLocations.velocities, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.accelerations);
    gl.uniform1i(programInfo.uniformLocations.accelerations, 2);
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
