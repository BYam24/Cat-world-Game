precision highp float;
precision highp int;
varying vec4 vPosition;

varying vec4 vColor;
varying vec3 vNormal;
varying vec2 vUv;

uniform float outlineWidth; // Uniform for outline width
uniform bool outline;
uniform vec3 cameraPos;

void main() {
    // We can use macros in shaders.
    // The one below checks for a THREEJS variable that indicates whether the shader uses color information from the provided model's vertices
    #ifdef USE_COLOR
    vColor = vec4(color.xyz, 1.0);
    #else
    vColor = vec4(1.0,1.0,1.0,1.0);
    #endif
    vNormal = normalMatrix * normal;

//    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
//    float distance = length(cameraPos - worldPosition.xyz);
//    float adjustedOutline = outlineWidth * distance;

//    vec3 outlinePosition = position + (normalize(vNormal)* adjustedOutline);
    vec3 outlinePosition = position + (normalize(vNormal) * outlineWidth);

    vUv = vec2(uv.x,1.0-uv.y);
    if(outline){
        gl_Position = projectionMatrix * modelViewMatrix * vec4(outlinePosition, 1.0);
    } else {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
}
