// The home's WebGL journey: a starfield and one procedurally shaded planet
// per world, laid out along the -z axis. The camera flies between "stops"
// (hero, each world, the closing route) following the scroll, damped so it
// never snaps. With reduced motion the camera jumps between stops and nothing
// spins, twinkles or eases. Without WebGL the page keeps its plain space
// background and every word stays readable.
import {
  type IUniform,
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { gsap } from '@/animations/gsap';
import { MOTION_CONDITIONS, readMotionToken, readNumber } from '@/animations/motion';
import type { WorldId } from '@/data/worlds';
import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
  planetFragmentShader,
  planetVertexShader,
  starFragmentShader,
  starVertexShader,
} from './planet-shaders';

interface PlanetLook {
  scale: number;
  bands: number;
  cloud: number;
  emissive: number;
  terminator: number;
  seed: number;
  radius: number;
  /** Luminous glyph network (Sel). */
  lines?: number;
  /** Blown-out day side (Canticle). */
  scorch?: number;
  /** Small moons in orbit (Lumar's twelve). */
  moons?: number;
}

// Surface character per world. Colours come from the CSS tokens
// (--planet-<id>-deep|mid|light|atmo|cloud) so they live in one place.
const LOOKS: Record<WorldId, PlanetLook> = {
  scadrial: {
    scale: 2.2,
    bands: 0.1,
    cloud: 0.75,
    emissive: 0.2,
    terminator: 0.1,
    seed: 1.3,
    radius: 1.25,
  },
  sel: {
    scale: 2.6,
    bands: 0,
    cloud: 0.15,
    emissive: 0,
    terminator: 0.12,
    seed: 4.1,
    radius: 1.05,
    lines: 1,
  },
  nalthis: {
    scale: 1.6,
    bands: 0.55,
    cloud: 0.15,
    emissive: 0,
    terminator: 0.14,
    seed: 7.7,
    radius: 1.1,
  },
  roshar: {
    scale: 2,
    bands: 0.8,
    cloud: 0.85,
    emissive: 0,
    terminator: 0.12,
    seed: 2.4,
    radius: 1.35,
  },
  taldain: {
    scale: 2.4,
    bands: 0.1,
    cloud: 0,
    emissive: 0,
    terminator: 0.02,
    seed: 9.2,
    radius: 1.1,
  },
  lumar: {
    scale: 3.2,
    bands: 0.25,
    cloud: 0.25,
    emissive: 0.15,
    terminator: 0.12,
    seed: 5.5,
    radius: 1.05,
    moons: 12,
  },
  komashi: {
    scale: 2.6,
    bands: 0,
    cloud: 0.4,
    emissive: 0.7,
    terminator: 0.1,
    seed: 3.3,
    radius: 1.05,
  },
  canticle: {
    scale: 2,
    bands: 0.1,
    cloud: 0,
    emissive: 1,
    terminator: 0.08,
    seed: 6.6,
    radius: 1.15,
    scorch: 0.85,
  },
};

// One star lights every world from the upper left, so each reads as a sphere.
const SUN = new Vector3(-1, 0.4, 0.35).normalize();
const STOP_SPACING = 16;
const STAR_COUNT = 3200;
// Largest planet radius including its atmosphere shell.
const MAX_EXTENT = 1.35 * 1.12;
// Opacity of the worlds waiting ahead: the next one, and the one after it.
const NEXT_FADE = 0.4;
const FAR_FADE = 0.22;
// Route worlds stand out in the closing line-up; the rest recede.
const ROUTE_SCALE = 1.3;
const ROUTE_PAIR_SCALE = 0.95;
const BACK_SCALE = 0.55;
const BACK_FADE = 0.32;
// Moon tints cycle through the worlds' accents: spores of every colour.
const MOON_TINTS: WorldId[] = ['lumar', 'canticle', 'roshar', 'taldain', 'nalthis', 'sel'];

interface Stop {
  position: Vector3;
  target: Vector3;
}

interface Moon {
  mesh: Mesh;
  radius: number;
  speed: number;
  phase: number;
  tilt: number;
}

interface PlanetEntry {
  id: WorldId;
  baseRadius: number;
  /** Where the planet sits when the camera visits it. */
  position: Vector3;
  /** Where it waits while it is the next world ahead. */
  waiting: Vector3;
  /** Where it waits, smaller and further back, two worlds ahead. */
  waitingFar: Vector3;
  /** Its place in the closing line-up. */
  lineup: Vector3;
  lineupScale: number;
  lineupFade: number;
  journeyScale: number;
  highlight: number;
  surface: Mesh;
  atmosphere: Mesh;
  moons: Moon[];
  time: IUniform<number>;
  fade: IUniform<number>;
  glow: IUniform<number>;
}

interface StarField {
  points: Points;
  time: IUniform<number>;
  pixelRatio: IUniform<number>;
}

export interface CosmosElements {
  canvas: HTMLCanvasElement;
  /** Scroll anchors in stop order: hero, one per world, closing route. */
  sections: HTMLElement[];
  /** Route steps carrying `data-route-worlds="id[,id]"`. */
  routeSteps: HTMLElement[];
  /** The fixed journey index on the right edge, if any. */
  rail: HTMLElement | null;
}

function readColor(name: string): Color {
  return new Color(readMotionToken(name) || '#ffffff');
}

function smoothstep(t: number): number {
  const x = gsap.utils.clamp(0, 1, t);
  return x * x * (3 - 2 * x);
}

function planetMaterial(
  id: WorldId,
  look: PlanetLook,
  time: IUniform<number>,
  fade: IUniform<number>,
): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: planetVertexShader,
    fragmentShader: planetFragmentShader,
    uniforms: {
      uDeep: { value: readColor(`--planet-${id}-deep`) },
      uMid: { value: readColor(`--planet-${id}-mid`) },
      uLight: { value: readColor(`--planet-${id}-light`) },
      uAtmo: { value: readColor(`--planet-${id}-atmo`) },
      uCloudTint: { value: readColor(`--planet-${id}-cloud`) },
      uSunDir: { value: SUN },
      uScale: { value: look.scale },
      uBands: { value: look.bands },
      uCloud: { value: look.cloud },
      uEmissive: { value: look.emissive },
      uTerminator: { value: look.terminator },
      uSeed: { value: look.seed },
      uLines: { value: look.lines ?? 0 },
      uScorch: { value: look.scorch ?? 0 },
      uTime: time,
      uFade: fade,
    },
    // Transparent so worlds fade into the starfield, not to black.
    transparent: true,
  });
}

function createMoons(count: number, fade: IUniform<number>, time: IUniform<number>): Moon[] {
  return Array.from({ length: count }, (_, index) => {
    const tint = MOON_TINTS[index % MOON_TINTS.length] ?? 'lumar';
    const look: PlanetLook = {
      scale: 3,
      bands: 0,
      cloud: 0,
      emissive: 0,
      terminator: 0.1,
      seed: index * 1.7,
      radius: 0.07,
    };
    const mesh = new Mesh(new SphereGeometry(1, 24, 24), planetMaterial(tint, look, time, fade));
    return {
      mesh,
      radius: 1.7 + (index % 4) * 0.22,
      speed: 0.18 + (index % 3) * 0.05,
      phase: (index / count) * Math.PI * 2,
      tilt: 0.35 + (index % 2) * 0.15,
    };
  });
}

function createPlanet(id: WorldId, index: number): PlanetEntry {
  const look = LOOKS[id];
  const time: IUniform<number> = { value: 0 };
  const fade: IUniform<number> = { value: 1 };
  const glow: IUniform<number> = { value: 1.1 };

  const surface = new Mesh(new SphereGeometry(1, 128, 128), planetMaterial(id, look, time, fade));
  surface.rotation.z = 0.25 * (index % 2 === 0 ? 1 : -1);

  const atmosphere = new Mesh(
    new SphereGeometry(1.12, 64, 64),
    new ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uAtmo: { value: readColor(`--planet-${id}-atmo`) },
        uSunDir: { value: SUN },
        uStrength: glow,
        uFade: fade,
      },
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );

  return {
    id,
    baseRadius: look.radius,
    position: new Vector3(),
    waiting: new Vector3(),
    waitingFar: new Vector3(),
    lineup: new Vector3(),
    lineupScale: 1,
    lineupFade: 1,
    journeyScale: 1,
    highlight: 0,
    surface,
    atmosphere,
    moons: createMoons(look.moons ?? 0, fade, time),
    time,
    fade,
    glow,
  };
}

function createStars(): StarField {
  const positions: number[] = [];
  const sizes: number[] = [];
  const phases: number[] = [];
  for (let i = 0; i < STAR_COUNT; i += 1) {
    positions.push(
      gsap.utils.random(-70, 70),
      gsap.utils.random(-45, 45),
      gsap.utils.random(-STOP_SPACING * 10 - 60, 20),
    );
    sizes.push(Math.random() < 0.06 ? gsap.utils.random(2.2, 3.4) : gsap.utils.random(0.6, 1.6));
    phases.push(Math.random() * Math.PI * 2);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));

  const time: IUniform<number> = { value: 0 };
  const pixelRatio: IUniform<number> = { value: 1 };
  const points = new Points(
    geometry,
    new ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        uTime: time,
        uPixelRatio: pixelRatio,
        uColor: { value: readColor('--color-text') },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  return { points, time, pixelRatio };
}

/** Mounts the journey. Returns a cleanup function. */
export function initCosmos(worldIds: WorldId[], elements: CosmosElements): () => void {
  const { canvas, sections, routeSteps, rail } = elements;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return () => undefined;
  }

  renderer.setClearColor(readColor('--color-space'), 1);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 400);
  const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);

  const planets = worldIds.map((id, index) => {
    const planet = createPlanet(id, index);
    scene.add(planet.surface, planet.atmosphere, ...planet.moons.map((moon) => moon.mesh));
    return planet;
  });
  const stars = createStars();
  scene.add(stars.points);

  let stops: Stop[] = [];
  let wide = true;
  let routeVisibility = 1;
  const highlighted = new Set<WorldId>();
  const lookTarget = new Vector3();
  const placed = new Vector3();
  const spin = readNumber('--planet-spin');
  const damping = readNumber('--camera-damping');

  const layout = (): void => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const aspect = width / Math.max(height, 1);
    wide = aspect >= 1;
    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    stars.pixelRatio.value = pixelRatio;

    // World stops. Desktop sets each planet beside its copy and keeps its limb
    // clear of the journey index; narrow screens stack it above the copy.
    const stopDistance = wide ? 7.2 : 9.5;
    const stopHalfWidth = stopDistance * tanHalfFov * aspect;
    const railLeft = rail?.getBoundingClientRect().left ?? width;
    const railWorld =
      rail && railLeft < width ? ((width - railLeft) / width) * 2 * stopHalfWidth : 0;
    const journeyScale = wide ? gsap.utils.clamp(0.8, 1, aspect / 1.6) : 1;
    const xRight = Math.min(2.1, stopHalfWidth * 0.96 - railWorld - MAX_EXTENT * journeyScale);
    const xLeft = -Math.min(2.1, stopHalfWidth * 0.96 - MAX_EXTENT * journeyScale);

    // The next two worlds wait beyond and above the current planet, on its
    // side, receding in perspective, so the copy column stays clear. They
    // cross to their own side only during the flight.
    const waitDepth = STOP_SPACING + stopDistance;
    const waitX = 0.62 * waitDepth * tanHalfFov * aspect;
    const waitY = wide ? 0.24 * waitDepth * tanHalfFov : 0;
    const farDepth = waitDepth + STOP_SPACING;
    const farX = 0.72 * farDepth * tanHalfFov * aspect;
    const farY = 0.34 * farDepth * tanHalfFov;

    planets.forEach((planet, index) => {
      const side = index % 2 === 0 ? 1 : -1;
      const z = -index * STOP_SPACING;
      planet.journeyScale = journeyScale;
      planet.position.set(wide ? (side > 0 ? xRight : xLeft) : 0, 0, z);
      // On narrow screens every planet is centred: the next one waits on the right.
      planet.waiting.set(wide ? -side * waitX : waitX, waitY, z);
      // Two stops ahead, the current planet is on this planet's own side.
      planet.waitingFar.set(side * farX, farY, z);
    });

    const first = planets[0]?.position ?? new Vector3();
    const heroStop: Stop = wide
      ? {
          position: new Vector3(first.x - 1.3, 0.95, first.z + 4.6),
          target: new Vector3(first.x - 1.3, 0.95, first.z),
        }
      : {
          position: new Vector3(0, 2.2, first.z + 6.4),
          target: new Vector3(0, 2.2, first.z),
        };

    const worldStops: Stop[] = planets.map(({ position }) => {
      const lift = wide ? 0 : -1.7;
      return {
        position: new Vector3(0, lift, position.z + stopDistance),
        target: new Vector3(0, lift, position.z),
      };
    });

    // Closing route: each route world stands above its step, the rest recede
    // into a dim back row.
    const lastZ = planets.at(-1)?.position.z ?? 0;
    const closingDistance = wide ? 30 : 46;
    const halfHeight = closingDistance * tanHalfFov;
    const halfWidth = halfHeight * aspect;
    const toWorldX = (px: number): number => (px / width) * 2 * halfWidth - halfWidth;
    const frontY = halfHeight * (wide ? 0.5 : 0.7);
    const routed = new Set<WorldId>();

    routeSteps.forEach((step, stepIndex) => {
      const ids = (step.dataset.routeWorlds ?? '').split(',').filter(Boolean) as WorldId[];
      const pair = ids.length > 1;
      const scale = pair ? ROUTE_PAIR_SCALE : ROUTE_SCALE;
      // Desktop: aligned to the step's column. Narrow screens stack the steps,
      // so the groups sit in two rows of two in the band above the heading.
      const rect = step.getBoundingClientRect();
      const slotCenter = (stepIndex % 2 === 0 ? -1 : 1) * halfWidth * 0.45;
      const rowY = frontY - Math.floor(stepIndex / 2) * halfHeight * 0.25;
      const narrowScale = 0.62;
      ids.forEach((id, k) => {
        const planet = planets.find((entry) => entry.id === id);
        if (!planet) return;
        routed.add(id);
        const lineupScale = scale * (wide ? 1 : narrowScale);
        const radius = planet.baseRadius * lineupScale;
        planet.lineupScale = lineupScale;
        planet.lineupFade = 1;
        if (wide) {
          planet.lineup.set(toWorldX(rect.left) + radius * 1.2 + k * radius * 2.4, frontY, lastZ);
        } else {
          const start = slotCenter - (ids.length - 1) * radius * 1.2;
          planet.lineup.set(start + k * radius * 2.4, rowY, lastZ);
        }
      });
    });

    const others = planets.filter((planet) => !routed.has(planet.id));
    const backZ = lastZ - 24;
    const backHalfWidth = (closingDistance + 24) * tanHalfFov * aspect;
    others.forEach((planet, k) => {
      planet.lineupScale = BACK_SCALE;
      planet.lineupFade = BACK_FADE;
      planet.lineup.set(
        (-0.5 + (k + 0.5) / others.length) * backHalfWidth * 1.4,
        (closingDistance + 24) * tanHalfFov * (wide ? 0.82 : 0.9),
        backZ,
      );
    });

    stops = [
      heroStop,
      ...worldStops,
      {
        position: new Vector3(0, 0, lastZ + closingDistance),
        target: new Vector3(0, 0, lastZ),
      },
    ];
  };

  // Scroll → continuous stop index. Section j (j ≥ 1) flies the camera from
  // stop j-1 to stop j while its top travels from the viewport bottom to top.
  // On narrow screens the route's line-up also fades as the steps scroll over it.
  const scrollTarget = (): number => {
    const viewport = window.innerHeight;
    let target = 0;
    let lastTop = viewport;
    sections.forEach((section, j) => {
      if (j === 0) return;
      const top = section.getBoundingClientRect().top;
      lastTop = top;
      if (top < viewport) target = j - 1 + gsap.utils.clamp(0, 1, (viewport - top) / viewport);
    });
    routeVisibility = wide
      ? 1
      : 1 - gsap.utils.clamp(0, 1, (-lastTop - viewport * 0.1) / (viewport * 0.3));
    return target;
  };

  const placeScene = (progress: number, elapsed: number): void => {
    const maxIndex = stops.length - 1;
    const clamped = gsap.utils.clamp(0, maxIndex, progress);
    const index = Math.min(Math.floor(clamped), maxIndex - 1);
    const from = stops[index];
    const to = stops[index + 1];
    if (!from || !to) return;
    const t = smoothstep(clamped - index);
    camera.position.lerpVectors(from.position, to.position, t);
    lookTarget.lerpVectors(from.target, to.target, t);
    camera.lookAt(lookTarget);

    const closing = smoothstep(clamped - (maxIndex - 1));
    planets.forEach((planet, planetIndex) => {
      // Planet `i` is stop `i + 1`; the hero (stop 0) belongs to the first.
      const ahead = Math.max(0, planetIndex + 1 - Math.max(clamped, 1));
      const farFade = wide ? FAR_FADE : 0;
      let journeyFade: number;
      if (ahead <= 1) {
        placed.lerpVectors(planet.position, planet.waiting, smoothstep(ahead));
        journeyFade = 1 - (1 - NEXT_FADE) * ahead;
      } else if (ahead <= 2) {
        placed.lerpVectors(planet.waiting, planet.waitingFar, smoothstep(ahead - 1));
        journeyFade = gsap.utils.interpolate(NEXT_FADE, farFade, ahead - 1);
      } else {
        placed.copy(planet.waitingFar);
        journeyFade = Math.max(0, farFade * (1 - (ahead - 2) * 4));
      }
      placed.lerp(planet.lineup, closing);
      const scale =
        planet.baseRadius *
        gsap.utils.interpolate(planet.journeyScale, planet.lineupScale, closing) *
        (1 + 0.14 * planet.highlight);

      planet.fade.value = gsap.utils.interpolate(
        journeyFade,
        planet.lineupFade * routeVisibility,
        closing,
      );
      planet.glow.value = 1.1 + 0.9 * planet.highlight;
      planet.surface.position.copy(placed);
      planet.atmosphere.position.copy(placed);
      planet.surface.scale.setScalar(scale);
      planet.atmosphere.scale.setScalar(scale);

      const visible = planet.fade.value > 0.01;
      planet.surface.visible = visible;
      planet.atmosphere.visible = visible;
      planet.moons.forEach((moon) => {
        const angle = moon.phase + elapsed * moon.speed;
        const orbit = moon.radius * scale;
        moon.mesh.position.set(
          placed.x + Math.cos(angle) * orbit,
          placed.y + Math.sin(angle) * orbit * moon.tilt,
          placed.z + Math.sin(angle) * orbit,
        );
        moon.mesh.scale.setScalar(scale * 0.075);
        moon.mesh.visible = visible;
      });
    });
  };

  // Hovering or focusing a route step lights its world(s) in the line-up.
  const routeListeners = routeSteps.map((step) => {
    const ids = (step.dataset.routeWorlds ?? '').split(',').filter(Boolean) as WorldId[];
    const on = (): void => ids.forEach((id) => highlighted.add(id));
    const off = (): void => ids.forEach((id) => highlighted.delete(id));
    step.addEventListener('pointerenter', on);
    step.addEventListener('pointerleave', off);
    step.addEventListener('focusin', on);
    step.addEventListener('focusout', off);
    return (): void => {
      step.removeEventListener('pointerenter', on);
      step.removeEventListener('pointerleave', off);
      step.removeEventListener('focusin', on);
      step.removeEventListener('focusout', off);
    };
  });

  layout();
  let current = scrollTarget();
  let elapsed = 0;
  placeScene(current, elapsed);

  const resizeObserver = new ResizeObserver(() => {
    layout();
    placeScene(current, elapsed);
    renderer.render(scene, camera);
  });
  resizeObserver.observe(canvas);

  const mm = gsap.matchMedia();
  mm.add(MOTION_CONDITIONS, (context) => {
    const reduced = context.conditions?.reduced === true;
    let lastState = '';

    const tick = (_time: number, deltaMs: number): void => {
      const delta = Math.min(deltaMs / 1000, 0.1);
      const target = scrollTarget();
      const ease = 1 - Math.exp(-damping * delta);

      if (reduced) {
        // Jump between stops and redraw only when something changed.
        const state = `${Math.round(target)}|${[...highlighted].join()}|${routeVisibility.toFixed(2)}`;
        if (state === lastState) return;
        lastState = state;
        current = Math.round(target);
        planets.forEach((planet) => {
          planet.highlight = highlighted.has(planet.id) ? 1 : 0;
        });
      } else {
        elapsed += delta;
        current += (target - current) * ease;
        planets.forEach((planet) => {
          planet.surface.rotation.y += spin * delta;
          planet.time.value = elapsed;
          const goal = highlighted.has(planet.id) ? 1 : 0;
          planet.highlight += (goal - planet.highlight) * ease * 2;
        });
        stars.time.value = elapsed;
      }

      placeScene(current, elapsed);
      renderer.render(scene, camera);
    };

    if (reduced) current = Math.round(scrollTarget());
    placeScene(current, elapsed);
    renderer.render(scene, camera);
    canvas.classList.add('is-ready');
    gsap.ticker.add(tick);
    return (): void => {
      gsap.ticker.remove(tick);
    };
  });

  return (): void => {
    mm.revert();
    resizeObserver.disconnect();
    routeListeners.forEach((remove) => remove());
    planets.forEach(({ surface, atmosphere, moons }) => {
      [surface, atmosphere, ...moons.map((moon) => moon.mesh)].forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as ShaderMaterial).dispose();
      });
    });
    stars.points.geometry.dispose();
    (stars.points.material as ShaderMaterial).dispose();
    renderer.dispose();
  };
}
