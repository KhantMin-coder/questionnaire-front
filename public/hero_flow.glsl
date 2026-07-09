#ifdef GL_ES
precision mediump float;
#endif

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

float dfLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Distance function for a 3D low-poly user bust (box head + box shoulders)
float mapBust(vec3 p, float rotation) {
    vec3 q = p;
    q.xz = rot(rotation) * q.xz;
    
    // Low-poly Box Head
    float head = sdBox(q - vec3(0.0, 0.07, 0.0), vec3(0.038, 0.038, 0.038));
    
    // Low-poly Box Torso/Shoulders
    float torso = sdBox(q - vec3(0.0, -0.01, 0.0), vec3(0.065, 0.04, 0.035));
    
    return min(head, torso);
}

// Flat normal generator for low-poly face styling
vec3 getNormal(vec3 p, float rotation) {
    vec2 e = vec2(0.005, 0.0);
    return normalize(vec3(
        mapBust(p + e.xyy, rotation) - mapBust(p - e.xyy, rotation),
        mapBust(p + e.yxy, rotation) - mapBust(p - e.yxy, rotation),
        mapBust(p + e.yyx, rotation) - mapBust(p - e.yyx, rotation)
    ));
}

// Local raymarcher for each user node
vec3 renderBust(vec2 uv, vec2 nodePos, float rotation, vec3 baseColor, vec3 lightDir, vec3 bg) {
    vec2 localUV = uv - nodePos;
    if (length(localUV) > 0.12) return bg;
    
    vec3 ro = vec3(0.0, 0.0, -0.6);
    vec3 rd = normalize(vec3(localUV, 1.2));
    
    float t = 0.0;
    float d = 0.0;
    bool hit = false;
    vec3 p;
    
    for (int i = 0; i < 20; i++) {
        p = ro + rd * t;
        d = mapBust(p, rotation);
        t += d;
        if (d < 0.001) {
            hit = true;
            break;
        }
        if (t > 1.2) break;
    }
    
    if (hit) {
        vec3 n = getNormal(p, rotation);
        float diff = max(dot(n, lightDir), 0.15);
        vec3 col = baseColor * diff;
        float edge = smoothstep(0.4, 0.6, 1.0 - max(dot(n, -rd), 0.0));
        col += vec3(0.18) * edge;
        return col;
    }
    
    return bg;
}

// Electric wire flow path with high-frequency sine waves
float electricWire(vec2 uv, vec2 a, vec2 b, float time) {
    float wave = sin(uv.x * 60.0 - time * 30.0) * 0.007;
    float d = dfLine(uv + vec2(0.0, wave), a, b);
    return smoothstep(0.005, 0.001, d);
}

// Draw envelope shape (representing mail dispatch)
float drawEnvelope(vec2 uv, vec2 center, float angle) {
    vec2 p = uv - center;
    p = rot(angle) * p;
    
    if (abs(p.x) > 0.045 || abs(p.y) > 0.03) return 0.0;
    
    // Envelope border
    float dBox = max(abs(p.x) - 0.038, abs(p.y) - 0.024);
    float border = smoothstep(0.003, 0.001, abs(dBox));
    
    // Envelope fold
    vec2 tl = vec2(-0.038, 0.024);
    vec2 tr = vec2(0.038, 0.024);
    vec2 mid = vec2(0.0, -0.005);
    float fold = smoothstep(0.003, 0.001, min(dfLine(p, tl, mid), dfLine(p, tr, mid)));
    
    return max(border, fold);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    
    // Node positions (representing users in the survey flow)
    vec2 pA = vec2(-0.5, 0.0);   // Entry User
    vec2 pB = vec2(-0.15, 0.0);  // Fork Node
    vec2 pC = vec2(0.25, 0.2);   // Success User
    vec2 pD = vec2(0.25, -0.2);  // Delay/Follow-up User
    
    // Light direction
    vec3 lightDir = normalize(vec3(0.5, 0.8, -0.6));
    
    // Basic Forest Sage theme colors
    vec3 bgColor = vec3(0.95, 0.94, 0.91);      // Warm bone background
    vec3 wireColor = vec3(0.82, 0.85, 0.80);    // Subtle pale gray-green wires
    vec3 electricGlow = vec3(0.25, 0.52, 0.32); // Glowing sage green for signals
    vec3 userColor = vec3(0.11, 0.23, 0.16);    // Deep forest green for low-poly users
    
    vec3 col = bgColor;
    
    // 1. Draw electric wires (sparking connector lines)
    float wireAB = electricWire(uv, pA, pB, u_time);
    float wireBC = electricWire(uv, pB, pC, u_time);
    float wireBD = electricWire(uv, pB, pD, u_time);
    col = mix(col, wireColor, max(wireAB, max(wireBC, wireBD)) * 0.7);
    
    // 2. Animate and draw electric envelopes (mail dispatches)
    float t = fract(u_time * 0.45);
    float branchCycle = floor(u_time * 0.45);
    
    // Envelope 1: Moving from A to B
    vec2 envPos1 = mix(pA, pB, t);
    float env1 = drawEnvelope(uv, envPos1, 0.0);
    
    // Envelope 2 & 3: Alternating branches (B -> C or B -> D)
    vec2 envPos2 = mix(pB, pC, t);
    vec2 envPos3 = mix(pB, pD, t);
    float angleBC = atan(pC.y - pB.y, pC.x - pB.x);
    float angleBD = atan(pD.y - pB.y, pD.x - pB.x);
    
    float env2 = drawEnvelope(uv, envPos2, angleBC);
    float env3 = drawEnvelope(uv, envPos3, angleBD);
    
    // Branch switcher
    float selectBranch = step(1.0, mod(branchCycle, 2.0));
    float activeEnv = mix(env2, env3, selectBranch);
    
    // Draw envelope signals in glowing green
    col = mix(col, electricGlow, max(env1, activeEnv) * 0.95);
    
    // 3. Render 3D Low-Poly user busts at the node positions
    // User rotations driven by time for interactive feel
    float rotA = u_time * 0.5;
    float rotB = u_time * -0.4;
    float rotC = u_time * 0.3;
    float rotD = u_time * -0.6;
    
    col = renderBust(uv, pA, rotA, userColor, lightDir, col);
    col = renderBust(uv, pB, rotB, userColor, lightDir, col);
    col = renderBust(uv, pC, rotC, userColor, lightDir, col);
    col = renderBust(uv, pD, rotD, userColor, lightDir, col);
    
    gl_FragColor = vec4(col, 1.0);
}
