# ==========================================
# File: shrishti.py
# Author: Rahul Jangid
# Email: rj45010@gmail.com
# Purpose: Loads her bust from refs/shrishti.glb, reduces it for the web,
#          gives it a terracotta finish and carved clay eyes, adds the scroll
#          camera path and focus empties, and exports public/models/shrishti.glb.
#          Run: npm run model (add -- --preview <dir> for test renders)
# ==========================================
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

WEB = Path(__file__).resolve().parent.parent
REFS = WEB.parent / "refs"
SOURCE = REFS / "shrishti.glb"
FACES = 60000
EYES = ((-0.18, 0.179), (0.155, 0.179))
EYE_FRONT = -0.465
EYE_RADIUS = 0.07
EYE_OPENING = (0.08, 0.03)
OUT = WEB / "public" / "models" / "shrishti.glb"
PREVIEW = "--preview" in sys.argv


def look_at(cam, eye, target):
    cam.location = eye
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = (Vector(target) - Vector(eye)).to_track_quat("-Z", "Y")


def clay(bust):
    mat = bpy.data.materials.new("terracotta")
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (0.5, 0.17, 0.08, 1)
    bsdf.inputs["Roughness"].default_value = 0.82
    bust.data.materials.clear()
    bust.data.materials.append(mat)


def clay_material(name, rgb):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = 0.82
    return mat


def eyes(bust, nose):
    mesh = bmesh.new()
    mesh.from_mesh(bust.data)
    rx, rz = EYE_OPENING
    for dx, dz in EYES:
        cx, cz = nose.x + dx, nose.z + dz
        centre_y = EYE_FRONT + EYE_RADIUS
        rim = []
        for v in mesh.verts:
            reach = ((v.co.x - cx) / rx) ** 2 + ((v.co.z - cz) / rz) ** 2
            if v.co.y > EYE_FRONT + 0.06:
                continue
            if reach < 1:
                inside = max(EYE_RADIUS**2 - (v.co.x - cx) ** 2 - (v.co.z - cz) ** 2, 0)
                v.co.y = max(v.co.y, centre_y - inside**0.5 + 0.006)
            if reach < 1.6:
                rim.append(v)
        for _ in range(5):
            bmesh.ops.smooth_vert(mesh, verts=rim, factor=0.4, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    mesh.to_mesh(bust.data)
    mesh.free()

    white = clay_material("eye", (0.5, 0.17, 0.08))
    iris = clay_material("iris", (0.3, 0.09, 0.04))
    pupil = clay_material("pupil", (0.1, 0.03, 0.012))
    for side, (dx, dz) in zip(("left", "right"), EYES):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=EYE_RADIUS)
        ball = bpy.context.active_object
        ball.name = f"eye-{side}"
        ball.rotation_euler = (1.5708, 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
        ball.location = (nose.x + dx, EYE_FRONT + EYE_RADIUS, nose.z + dz)
        for mat in (white, iris, pupil):
            ball.data.materials.append(mat)
        for poly in ball.data.polygons:
            poly.use_smooth = True
            facing = -poly.normal.y
            poly.material_index = 2 if facing > 0.975 else 1 if facing > 0.8 else 0


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))
    bust = next(o for o in bpy.data.objects if o.type == "MESH")
    bust.name = "shrishti"
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = bust
    bust.select_set(True)
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    decimate = bust.modifiers.new("decimate", "DECIMATE")
    decimate.ratio = FACES / len(bust.data.polygons)
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    for poly in bust.data.polygons:
        poly.use_smooth = True
    clay(bust)

    world = bust.matrix_world
    nose = min((world @ v.co for v in bust.data.vertices), key=lambda co: co.y)
    eyes(bust, nose)

    def at(dx, dy, dz):
        return tuple(nose + Vector((dx, dy, dz)))

    focus = {
        "focus-0": at(0, 0.25, 0.02),
        "focus-1": at(0.14, 0.12, 0.12),
        "focus-2": at(0.36, 0.45, -0.02),
        "focus-3": at(-0.14, 0.12, 0.12),
        "focus-4": at(-0.32, 0.6, 0.2),
        "focus-5": at(0, 0.18, 0.02),
        "focus-works": at(0, 0.3, -0.1),
    }
    for name, co in focus.items():
        empty = bpy.data.objects.new(name, None)
        empty.location = co
        bpy.context.collection.objects.link(empty)

    cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    cam.data.lens = 59
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    hero_eye, hero_aim = at(0, -4.6, -0.08), at(0, 0.3, -0.08)
    works_eye, works_aim = at(0.3, -4.2, -0.05), at(0.1, 0.3, -0.05)
    shots = [
        (0, hero_eye, hero_aim),
        (50, at(1.0, -1.15, 0.25), focus["focus-1"]),
        (100, at(1.9, 0.15, 0.15), focus["focus-2"]),
        (150, at(-1.15, -1.3, 0.3), focus["focus-3"]),
        (200, at(-2.1, 2.0, 0.45), focus["focus-4"]),
        (250, works_eye, works_aim),
        (300, works_eye, works_aim),
        (350, at(1.8, -4.0, -0.15), at(1.6, 0.3, -0.15)),
    ]
    for frame, eye, target in shots:
        look_at(cam, eye, target)
        cam.keyframe_insert("location", frame=frame)
        cam.keyframe_insert("rotation_quaternion", frame=frame)
    cam.animation_data.action.name = "CameraAction"

    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, 350
    scene.render.fps = 24
    print("nose", tuple(round(c, 3) for c in nose))


def export():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUT),
        export_format="GLB",
        export_cameras=True,
        export_animations=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_apply=True,
    )
    print("exported", OUT, OUT.stat().st_size // 1024, "KB")


def preview(frames):
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = 960, 540
    scene.render.engine = "BLENDER_EEVEE"
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.55, 0.6, 0.45, 1)
    scene.world = world
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 3
    sun.rotation_euler = (0.8, 0.2, 0.6)
    bpy.context.collection.objects.link(sun)
    for f in frames:
        scene.frame_set(f)
        scene.render.filepath = str(Path(sys.argv[-1]) / f"frame-{f:03d}.png")
        bpy.ops.render.render(write_still=True)


build()
if PREVIEW:
    preview([0, 50, 100, 150, 200, 250, 300, 350])
else:
    export()
