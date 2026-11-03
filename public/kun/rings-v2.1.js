/* Six parametric time rings for the original v2 composition. No dependencies.
   Mobius parametrization: math.uci.edu/~vmm/Surface/moebius_strip/moebius_strip.html
   Morphing is a visual interpolation, not a claim of topology-preserving deformation. */
'use strict';
(() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const names = Object.freeze(['折叠环', '莫比乌斯环', '双轨扭环', '无限折带', '三叶结', '脉冲星环']);
  const codes = ['TEMPORAL FOLD', 'MOBIUS STRIP', 'TWIN ORBIT', 'INFINITY RIBBON', 'TREFOIL KNOT', 'PULSE HALO'];
  const smooth = t => t * t * t * (10 + t * (-15 + 6 * t));
  function framed(c, t, width, thickness, angle) {
    const nlen = Math.hypot(t[0], t[1]) || 1;
    const n = [-t[1] / nlen, t[0] / nlen, 0];
    const len = Math.hypot(...t) || 1;
    const tx = t[0] / len, ty = t[1] / len, tz = t[2] / len;
    const b = [-tz * n[1], tz * n[0], tx * n[1] - ty * n[0]];
    const ca = Math.cos(angle), sa = Math.sin(angle);
    return c.map((v, k) => v + n[k] * width * ca + b[k] * thickness * sa);
  }
  function point(shape, u, v) {
    const a = u * TAU, q = v * TAU;
    if (shape === 0) { // Original folded toroidal textile.
      const b = q + a * 2, r = 1.14 + .31 * Math.cos(b);
      return [r * Math.cos(a), r * Math.sin(a), .31 * Math.sin(b)];
    }
    if (shape === 1) { // Half twist. At u=1, v joins 1-v; no artificial closing chord.
      const w = (v * 2 - 1) * .55, r = 1.02 + w * Math.cos(a / 2);
      return [r * Math.cos(a), r * Math.sin(a), w * Math.sin(a / 2)];
    }
    if (shape === 2) { // Two linked loops; branch belongs to a stripe, never to its u samples.
      const branch = v < .5 ? 0 : 1, b = (v * 2 - branch) * TAU;
      const r = .86 + .13 * Math.cos(b + a * 2), z = .13 * Math.sin(b + a * 2);
      return branch === 0 ? [r * Math.cos(a) - .35, r * Math.sin(a), z]
        : [r * Math.cos(a) + .35, z, r * Math.sin(a)];
    }
    if (shape === 3) { // A lifted figure eight: the two crossings have different depths.
      const c = [1.42 * Math.sin(a), .63 * Math.sin(2 * a), .40 * Math.cos(a)];
      const t = [1.42 * Math.cos(a), 1.26 * Math.cos(2 * a), -.40 * Math.sin(a)];
      const w = (v * 2 - 1) * .26;
      return framed(c, t, w, w, a);
    }
    if (shape === 4) {
      const c = [.49 * (Math.sin(a) + 2 * Math.sin(2 * a)), .49 * (Math.cos(a) - 2 * Math.cos(2 * a)), -.47 * Math.sin(3 * a)];
      const t = [.49 * (Math.cos(a) + 4 * Math.cos(2 * a)), .49 * (-Math.sin(a) + 4 * Math.sin(2 * a)), -1.41 * Math.cos(3 * a)];
      return framed(c, t, .17, .17, q + a * 2);
    }
    const r = 1.05 + .22 * Math.cos(5 * a), b = q + a * 3;
    return [(r + .17 * Math.cos(b)) * Math.cos(a), (r + .17 * Math.cos(b)) * Math.sin(a), .26 * Math.sin(3 * a) + .17 * Math.sin(b)];
  }
  function makeGeometry(rows, steps) {
    const targets = names.map(() => new Float32Array(rows * (steps + 1) * 3));
    for (let s = 0; s < names.length; s++) {
      let max = 0;
      for (let row = 0; row < rows; row++) {
        // Closed tube rows omit their duplicate seam; open strips include both edges.
        const v = (s === 1 || s === 3) ? row / (rows - 1) : row / rows;
        for (let j = 0; j <= steps; j++) {
          const p = point(s, j / steps, v), k = (row * (steps + 1) + j) * 3;
          targets[s].set(p, k); max = Math.max(max, Math.hypot(...p));
        }
      }
      // Uniform scale preserves each shape's proportions and leaves room for rotation.
      const scale = 1.53 / max;
      for (let k = 0; k < targets[s].length; k++) targets[s][k] *= scale;
    }
    return targets;
  }
  class RingEngine {
    constructor(canvas, stage, options = {}) {
      this.canvas = canvas; this.stage = stage; this.ctx = canvas.getContext('2d');
      if (!this.ctx) throw new Error('Canvas 2D unavailable');
      this.mobile = stage.clientWidth <= 600; this.rows = this.mobile ? 48 : 80; this.steps = this.mobile ? 144 : 216;
      this.targets = makeGeometry(this.rows, this.steps);
      this.shape = Number.isInteger(options.shape) ? clamp(options.shape, 0, 5) : 1;
      this.from = this.targets[this.shape].slice(); this.to = this.targets[this.shape];
      this.current = this.from.slice(); this.projected = this.from.slice(); this.blend = 1;
      this.time = 0; this.quiet = !!options.quiet; this.cold = !!options.cold; this.auto = options.auto !== false;
      this.autoElapsed = 0; this.rotation = [0, 0]; this.pointer = [0, 0]; this.look = [0, 0];
      this.suspended = false; this.interacting = false; this.charge = 0; this.progress = 0; this.free = false;
      this.burstAge = 99; this.frameId = 0; this.last = 0; this.frames = 0; this.onShape = options.onShape;
      this.fragments = [];
      const block = 12;
      for (let r = 0; r < this.rows; r++) for (let j = 0; j < this.steps; j += block) {
        this.fragments.push({row:r, start:j, end:Math.min(j + block, this.steps), z:0, hot:0});
      }
      this.resize(); this.restart();
    }
    select(index, animate = true, manual = true) {
      if (!Number.isFinite(index)) return;
      const i = ((Math.round(index) % 6) + 6) % 6;
      if (manual) this.auto = false;
      if (i !== this.shape) {
        this.sample(); this.from.set(this.current); this.to = this.targets[i];
        this.shape = i; this.blend = animate && !this.quiet ? 0 : 1;
      }
      this.autoElapsed = 0; this.onShape?.(this.shape, this.auto);
      this.draw(); this.restart();
    }
    setAuto(value) { this.auto = !!value; this.autoElapsed = 0; this.onShape?.(this.shape, this.auto); this.restart(); }
    setQuiet(value) { this.quiet = !!value; if (this.quiet) this.blend = 1; this.restart(); }
    setSuspended(value) { this.suspended = !!value; this.restart(); }
    burst() { this.burstAge = 0; this.draw(); }
    sample() {
      const t = smooth(this.blend);
      for (let k = 0; k < this.current.length; k++) this.current[k] = this.from[k] + (this.to[k] - this.from[k]) * t;
    }
    resize() {
      const rect = this.stage.getBoundingClientRect();
      this.w = Math.max(1, rect.width); this.h = Math.max(1, rect.height);
      this.mobile = this.w <= 600; this.dpr = Math.min(devicePixelRatio || 1, this.mobile ? 1.5 : 1.75);
      this.canvas.width = Math.round(this.w * this.dpr); this.canvas.height = Math.round(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); this.draw();
    }
    restart() {
      cancelAnimationFrame(this.frameId); this.frameId = 0; this.last = 0;
      this.draw();
      if (!this.quiet && !this.suspended && !document.hidden) this.frameId = requestAnimationFrame(t => this.frame(t));
    }
    frame(t) {
      this.frameId = 0;
      if (this.quiet || this.suspended || document.hidden) return;
      if (!this.last) this.last = t;
      if (t - this.last >= 1000 / 30) {
        const dt = Math.min((t - this.last) / 1000, .12); this.last = t;
        this.time += dt; this.burstAge += dt; this.blend = Math.min(1, this.blend + dt / 2.4);
        this.look[0] += (this.pointer[0] - this.look[0]) * .07; this.look[1] += (this.pointer[1] - this.look[1]) * .07;
        if (!this.interacting) this.autoElapsed += dt;
        if (this.auto && !this.interacting && this.autoElapsed >= 12) this.select(this.shape + 1, true, false);
        this.draw(); this.frames++;
      }
      // select() above may have scheduled a frame; never leave two animation loops running.
      cancelAnimationFrame(this.frameId); this.frameId = requestAnimationFrame(x => this.frame(x));
    }
    draw() {
      const ctx = this.ctx, W = this.w, H = this.h;
      if (!W || !H) return;
      this.sample(); ctx.clearRect(0, 0, W, H);
      const t = this.time, mobile = this.mobile;
      const cx = W * (mobile ? .65 : .685) + this.look[0] * 9;
      const cy = H * .456 + this.look[1] * 7;
      const size = Math.min(W * (mobile ? .215 : .195), H * (mobile ? .21 : .295));
      const rx = .64 + this.rotation[1] + this.look[1] * .13 + Math.sin(t * .18) * .065;
      const ry = -.32 + this.rotation[0] + this.look[0] * .13 + Math.sin(t * .14) * .32;
      const rz = -.43 + Math.sin(t * .12) * .11;
      const ax = Math.cos(rx), bx = Math.sin(rx), ay = Math.cos(ry), by = Math.sin(ry), az = Math.cos(rz), bz = Math.sin(rz);
      const pulse = 1 + Math.sin(t * .65) * .015 + this.charge * .11 + (this.free ? .035 : 0);
      const p = this.projected, c = this.current;
      for (let k = 0; k < c.length; k += 3) {
        const x = c[k], y = c[k+1], z = c[k+2];
        const yy = y * ax - z * bx, zz = y * bx + z * ax;
        const xx = x * ay + zz * by, depth = -x * by + zz * ay;
        const perspective = 4.9 / (4.9 - depth * .30);
        p[k] = cx + (xx * az - yy * bz) * size * perspective * pulse;
        p[k+1] = cy + (xx * bz + yy * az) * size * perspective * pulse;
        p[k+2] = depth;
      }
      const glow = ctx.createRadialGradient(cx, cy, size * .1, cx, cy, size * 1.7);
      glow.addColorStop(0, this.cold ? '#529bb310' : '#ff682713'); glow.addColorStop(.62, this.cold ? '#39889e0b' : '#c646150a'); glow.addColorStop(1,'#00000000');
      ctx.fillStyle = glow; ctx.fillRect(cx-size*2, cy-size*2, size*4, size*4);
      // Original fine reference orbit; the moving hot segments live on the actual surface.
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(-.43); ctx.strokeStyle = this.cold ? '#a3d9e516' : '#ff805916'; ctx.lineWidth = .65;
      ctx.beginPath(); ctx.ellipse(0,0,size*1.73,size*1.33,0,0,TAU); ctx.stroke(); ctx.restore();
      const stride = (this.steps + 1) * 3;
      const sweep = (t * .10) % 1;
      for (const f of this.fragments) {
        const a = f.row * stride + f.start * 3, b = f.row * stride + f.end * 3;
        f.z = (p[a+2] + p[b+2]) * .5;
        let d = Math.abs((f.start + f.end) / (this.steps * 2) - ((sweep + f.row * .0017) % 1)); d = Math.min(d, 1-d);
        f.hot = Math.exp(-d*d/.0035);
      }
      this.fragments.sort((a,b) => a.z - b.z);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const f of this.fragments) {
        const front = clamp(.48 + f.z * .32), texture = (Math.cos(f.row / this.rows * TAU) + 1) * .5;
        const light = clamp(.12 + front * .55 + f.hot * .45 + texture * .09);
        const alpha = clamp(.13 + front * .47 + f.hot * .28, .08, .92) * (mobile ? .92 : 1);
        const r = this.cold ? Math.round(74 + light * 170) : Math.round(185 + light * 70);
        const g = this.cold ? Math.round(144 + light * 106) : Math.round(57 + light * 164);
        const b = this.cold ? Math.round(175 + light * 80) : Math.round(29 + light * 150);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.lineWidth = (mobile ? .62 : .68) + front * .25 + f.hot * .45;
        const offset = f.row * stride; ctx.beginPath();
        for (let j = f.start; j <= f.end; j++) { const k = offset + j*3; if (j === f.start) ctx.moveTo(p[k],p[k+1]); else ctx.lineTo(p[k],p[k+1]); }
        ctx.stroke();
      }
      // Traveling filaments: wide faint halo, then a sharp warm-white core, without flashes.
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let trace = 0; trace < 7; trace++) {
        const row = Math.round(trace / 6 * (this.rows - 1)), offset = row * stride;
        const head = ((sweep + trace * .137) % 1) * this.steps;
        for (let piece = 0; piece < 5; piece++) {
          const u1 = head - (5-piece)*2.3, u2 = head - (4-piece)*2.3;
          if (u1 < 0 || u2 > this.steps) continue; // Do not bridge a Mobius seam with a spurious chord.
          const j1 = Math.floor(u1), j2 = Math.min(this.steps,Math.ceil(u2));
          ctx.beginPath(); for(let j=j1;j<=j2;j++){const k=offset+j*3;if(j===j1)ctx.moveTo(p[k],p[k+1]);else ctx.lineTo(p[k],p[k+1]);}
          ctx.lineWidth = 4.3; ctx.strokeStyle = this.cold ? `rgba(80,191,231,${.035+piece*.013})` : `rgba(255,111,52,${.035+piece*.013})`; ctx.stroke();
          ctx.lineWidth = .9 + piece*.14; ctx.strokeStyle = this.cold ? `rgba(203,246,255,${.16+piece*.14})` : `rgba(255,221,176,${.16+piece*.14})`; ctx.stroke();
        }
        const k=offset+Math.floor(head)*3, dot = ctx.createRadialGradient(p[k],p[k+1],0,p[k],p[k+1],7);
        dot.addColorStop(0,this.cold?'#e4faffc0':'#ffe6c6b0');dot.addColorStop(.25,this.cold?'#7dd9ff50':'#ffb66f50');dot.addColorStop(1,'#00000000');
        ctx.fillStyle=dot;ctx.beginPath();ctx.arc(p[k],p[k+1],7,0,TAU);ctx.fill();
      }
      ctx.restore();
      const a = this.progress * TAU - Math.PI/2;
      const ox = Math.cos(a)*size*1.73, oy = Math.sin(a)*size*1.33;
      ctx.fillStyle=this.cold?'#d4f5ff':'#ffccb1';ctx.beginPath();ctx.arc(cx+ox*Math.cos(-.43)-oy*Math.sin(-.43),cy+ox*Math.sin(-.43)+oy*Math.cos(-.43),1.7,0,TAU);ctx.fill();
      if (!this.quiet && (this.charge > 0 || this.burstAge < 2.8)) {
        const expanding = this.burstAge < 2.8, age = this.burstAge;
        const opacity = expanding ? (1-age/2.8)*.55 : this.charge*.35;
        ctx.strokeStyle=this.cold?`rgba(163,217,229,${opacity})`:`rgba(255,170,119,${opacity})`;ctx.lineWidth=1;
        for(let i=0;i<48;i++){const angle=i*2.39996,rad=size*(1.55+(expanding?age*.8:this.charge*.2))+(i%7)*9,len=expanding?12+age*16:this.charge*40;ctx.beginPath();ctx.moveTo(cx+Math.cos(angle)*rad,cy+Math.sin(angle)*rad*.7);ctx.lineTo(cx+Math.cos(angle)*(rad+len),cy+Math.sin(angle)*(rad+len)*.7);ctx.stroke();}
      }
    }
  }
  window.KunRings = Object.freeze({Engine: RingEngine, names, codes:Object.freeze(codes), point, makeGeometry, version:'2.1'});
})();
