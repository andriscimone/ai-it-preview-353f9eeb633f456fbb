# Keel K-1

A hypothetical successor to the motorcycle: a two-seat, enclosed, electric two-wheeler that balances on a pair of control moment gyroscopes, drives itself in mapped areas, and is about the size of a touring motorcycle. Every subsystem is sized against hardware that exists in 2026. Nothing has been built or measured; the figures are design targets or modeled estimates.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Interactive viewer and full spec sheet. Orbit the model, switch to X-ray, open the gull-wing doors, ride (lean demo) or park (landing legs). |
| `keel-model.js` | Builds the model procedurally with Three.js: lofted body sections, doors, wheels, hub motors, gyro gimbals and rotors, landing legs, battery, cabin. |
| `keel-k1.glb` | The 3D model as glTF 2.0 binary (neutral pose, named parts, PBR materials). Opens in Blender, Windows 3D Viewer or any glTF viewer. |

The page loads Three.js 0.170.0 from jsDelivr, so it needs a network connection. Serve the folder with any static server (for example `python -m http.server`) and open `keel-k1/index.html`. Opening the file directly from disk will not load the ES modules.

To regenerate `keel-k1.glb` after changing `keel-model.js`, open the page and run `await keelExportGLB()` in the browser console; it returns the binary glTF as an `ArrayBuffer`.

Model conventions: metres, +X forward, +Y up, +Z to the vehicle's right, ground at y = 0, origin midway between the axles. Moving parts are separate nodes: `Door_L`, `Door_R`, `Steering`, `Wheel_Front_Spin`, `Wheel_Rear_Spin`, `CMG_L_Gimbal`, `CMG_R_Gimbal`, `CMG_*_Rotor`, `Leg_L`, `Leg_R`.

## Specifications

### Dimensions and mass

| | |
| --- | --- |
| Length × width × height | 2,790 × 860 × 1,480 mm |
| Wheelbase | 1,860 mm |
| Stance with legs out | 1,120 mm |
| Ground clearance | 165 mm |
| Door sill height | 540 mm |
| Footprint | 2.4 m² (a 4.2 × 1.8 m small car covers 7.6 m²) |
| Curb / gross mass | 338 kg / 523 kg |
| Centre of mass | 0.47 m curb, 0.57 m loaded |
| Turning circle | 6.5 m (±35° steering lock) |
| Luggage | 70 L tail trunk |

### Balance system

| | |
| --- | --- |
| Type | Two single-gimbal control moment gyroscopes, scissored so their yaw torques cancel |
| Rotors | Ø 240 mm maraging steel, 9 kg each, in vacuum housings with burst liners |
| Speed | 24,000 rpm (rim speed 302 m/s) |
| Angular momentum | 261 N·m·s per rotor |
| Roll torque | 910 N·m per unit, 1,820 N·m combined (3.5 rad/s gimbal rate) |
| Stored energy | 0.09 kWh per rotor |
| Spin-up | about 95 s at 3.5 kW, started when the vehicle is summoned |
| Redundancy | Either unit alone recovers a fully loaded K-1 from about 18° of lean, or holds it against a 25 m/s side gust (about 830 N·m) |
| Speed regimes | 0–20 km/h gyros; 20–50 km/h gyros and steering; above 50 km/h steering balance with gyros damping disturbances |
| Maximum lean | 40° in Ride mode (set by the keel-shaped underside), 25° when driving itself |
| Fallback | Two telescoping landing legs, 0.3 s to deploy |
| Mass | 32 kg for both units |

### Powertrain and chassis

| | |
| --- | --- |
| Rear motor | In-wheel axial-flux, 120 kW peak, 55 kW continuous, 12 kg |
| Front motor | In-hub axial-flux, 30 kW peak (traction and front-wheel regeneration) |
| System output | 150 kW (201 hp) peak, 70 kW continuous |
| 0–100 km/h | 3.4 s (Ride mode, one occupant); capped at 0.3 g when driving itself |
| Top speed | 200 km/h, limited; needs only about 32 kW |
| Electrical | 800 V, silicon-carbide inverters |
| Brakes | Up to 100 kW regenerative on both wheels; brake-by-wire with hydraulic fallback; 340 / 260 mm discs; cornering ABS |
| Suspension | Hub-centre steering on a single-sided front arm (110 mm); single-sided rear swingarm (120 mm), semi-active damping |
| Steering | Steer-by-wire, two independent actuators |
| Tyres | 130/70 R17 front, 160/60 R17 rear |

### Battery and charging

| | |
| --- | --- |
| Chemistry | Solid-state lithium-metal pouch cells, sulfide electrolyte |
| Cells | 400 Wh/kg, 900 Wh/L |
| Pack | 30 kWh gross, 28 kWh usable, 95 kg, structural floor pack in seven trapezoidal modules |
| DC fast charge | 110 kW peak, 10–80% in 15 min (about 370 km added) |
| AC / wireless | 11 kW plug or 11 kW inductive pad, so it can park on a charger by itself |
| Vehicle-to-load | 3.6 kW |
| Cycle life target | 1,000 cycles to 80%, about 500,000 km |

### Range (modeled)

| Driving | Wh/km | Range |
| --- | ---: | ---: |
| Steady 50 km/h | 33 | 855 km |
| Steady 90 km/h | 48 | 590 km |
| Steady 100 km/h | 54 | 520 km |
| Steady 120 km/h | 68 | 410 km |
| Steady 130 km/h | 77 | 365 km |
| City, with climate control | 52 | 535 km |
| Mixed (⅓ city, ⅓ at 80, ⅓ at 115) | 53 | 530 km |

Inputs: drag area 0.24 m² (Cd 0.26 × 0.92 m²), rolling resistance 0.009, 423 kg test mass, 88% battery-to-wheel efficiency, 600 W constant auxiliary load (800 W in town), city cycle with two stops per km and 70% regeneration, 28 kWh usable. About 59 Wh/km from the wall (roughly 355 MPGe), against 205.3 MPGe for the 651 kg Peraves E-Tracer that won the 2010 Automotive X Prize tandem class.

### Autonomy and sensing

| | |
| --- | --- |
| Modes | Chauffeur (SAE Level 4 in mapped areas), Co-pilot (supervised Level 2+), Ride (manual with a safety envelope), Valet (drives itself empty) |
| Lidar | 2 solid-state units, nose and tail |
| Cameras | 8 exterior at 8 MP (360°), 1 cabin |
| Radar | 3 imaging (4D) radars |
| Positioning | Dual-band RTK GNSS, two fibre-optic IMUs, C-V2X |
| Computer | 2 automotive AI chips at 1,000 INT8 TOPS each (DRIVE AGX Thor class); either can bring the vehicle to a safe stop |
| Software | Learned driving policy inside a rule-based safety envelope; the 1 kHz balance controller runs separately on a lockstep safety controller |

### Safety and cabin

| | |
| --- | --- |
| Structure | Carbon-fibre monocoque, aluminium crash boxes; the roof spine is the roll hoop and the door hinge |
| Restraints | 3-point belts on both seats, 5 airbags |
| Helmets | Designed for helmet-free use where the law allows, as the roofed BMW C1 was in several European countries |
| Seating | 1 + 1 tandem, rear seat raised 150 mm |
| Canopy | Electrochromic laminated glazing, two gull-wing doors |
| Controls | Fold-away yoke with twist-grip throttle, head-up display |
| Indicative price | €35,000–45,000 at volume (rough estimate) |

## What already exists

| Subsystem | Closest real thing (October 2026) | Status |
| --- | --- | --- |
| Gyro balance on two wheels | Lit Motors C-1, two CMGs, about 1,760 N·m claimed | Prototype |
| Balance at walking pace | Honda Riding Assist (2017), steering only | Prototype |
| Solid-state cells | Factorial FEST 375 Wh/kg validated with Stellantis; Mercedes EQS prototype drove 1,205 km on Factorial cells (2025); QuantumScape QSE-5 301 Wh/kg, 844 Wh/L | Pilot lines |
| Axial-flux motors | YASA 59 kW/kg prototype (750 kW from 12.7 kg, October 2025) | Shipping |
| Driverless operation | Waymo, fully driverless in more than ten US cities, about 500,000 paid rides a week in early 2026 | Shipping, cars only |
| AI computer | NVIDIA DRIVE AGX Thor, 1,000 INT8 TOPS per chip | Shipping |
| Steer-by-wire | Tesla Cybertruck (2023) | Shipping |
| Enclosed two-wheeler efficiency | Peraves E-Tracer, 205.3 MPGe (2010 Automotive X Prize) | Built in small series |

The unsolved parts are certification and cost: proving the balance system is fail-operational, crash-testing a vehicle 86 cm wide against cars, and fitting lidar, two AI chips and two vacuum flywheels into something priced like a premium motorcycle.
