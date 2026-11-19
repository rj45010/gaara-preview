# ==========================================
# File: shrishti.py
# Author: Rahul Jangid
# Email: rj45010@gmail.com
# Purpose: Builds a white-cube gallery with her terracotta bust on a plinth and
#          her works framed on the walls, bakes the room's lighting in Cycles,
#          adds the scroll camera path and focus empties, and exports
#          public/models/shrishti.glb. Run: npm run model (-- --preview <dir>)
# ==========================================
import sys
from pathlib import Path

import bpy
from mathutils import Vector

WEB = Path(__file__).resolve().parent.parent
SOURCE = WEB.parent / "refs" / "shrishti.glb"
WORKS = WEB / "public" / "works"
OUT = WEB / "public" / "models" / "shrishti.glb"
PREVIEW = "--preview" in sys.argv

FACES = 40000
BUST_HEIGHT = 0.6
PLINTH = (0.5, 0.5, 1.05)
ROOM = (4.5, 3.8)
BACK_WALL = 3.0
FRONT_EDGE = -19.0
NEXT_ROOM = 6.5
DOOR = (2.6, 2.9)
PAINTING_H = 0.95
MOUNT = 0.12
HANG = 1.6
BAKE_SAMPLES = 64
PAINTINGS = (
    ("2026-1", "front", (-3.05, BACK_WALL)),
    ("2024-3", "front", (3.05, BACK_WALL)),
    ("2023-1", "left", (-4.5, 0.9)),
    ("2024-5", "left", (-4.5, -1.7)),
    ("2025-1", "right", (4.5, 0.9)),
    ("2023-2", "right", (4.5, -1.7)),
    ("2026-3", "front", (-1.6, BACK_WALL + 6.5)),
    ("2024-6", "front", (2.4, BACK_WALL + 3.2)),
    ("2026-5", "left", (-4.5, BACK_WALL + 3.5)),
)
WHITE = (0.82, 0.82, 0.8)


def look_at(obj, eye, target):
    obj.location = eye
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = (Vector(target) - Vector(eye)).to_track_quat("-Z", "Y")


def material(name, rgb, roughness=0.85, image=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    if image:
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def box(name, size, location, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    obj.data.materials.append(mat)
    return obj


def bust_on_plinth():
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))
    bust = next(o for o in bpy.data.objects if o.type == "MESH")
    bust.name = "sculpture"
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = bust
    bust.select_set(True)
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    for o in [o for o in bpy.data.objects if o is not bust]:
        bpy.data.objects.remove(o)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    decimate = bust.modifiers.new("decimate", "DECIMATE")
    decimate.ratio = FACES / len(bust.data.polygons)
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    for poly in bust.data.polygons:
        poly.use_smooth = True
    bust.data.materials.clear()
    bust.data.materials.append(material("terracotta", (0.5, 0.17, 0.08), 0.82))

    pts = [v.co for v in bust.data.vertices]
    lo = Vector([min(p[i] for p in pts) for i in range(3)])
    hi = Vector([max(p[i] for p in pts) for i in range(3)])
    k = BUST_HEIGHT / (hi.z - lo.z)
    bust.scale = (k, k, k)
    bust.location = (-(lo.x + hi.x) / 2 * k, -(lo.y + hi.y) / 2 * k, PLINTH[2] - lo.z * k)
    bpy.ops.object.transform_apply(location=True, scale=True)


def room():
    half, height = ROOM
    far = BACK_WALL + NEXT_ROOM
    depth = far - FRONT_EDGE
    mid = (far + FRONT_EDGE) / 2
    door_w, door_h = DOOR
    side_w = half - door_w / 2
    baked = [
        box("room-floor", (half * 2, depth, 0.1), (0, mid, -0.05), material("floor", (0.16, 0.16, 0.155), 0.3)),
        box("room-ceiling", (half * 2, depth, 0.1), (0, mid, height + 0.05), material("ceiling", WHITE, 0.95)),
        box("room-left", (0.1, depth, height), (-half - 0.05, mid, height / 2), material("left", WHITE, 0.95)),
        box("room-right", (0.1, depth, height), (half + 0.05, mid, height / 2), material("right", WHITE, 0.95)),
        box("room-back-l", (side_w, 0.2, height), (-half + side_w / 2, BACK_WALL + 0.1, height / 2), material("back-l", WHITE, 0.95)),
        box("room-back-r", (side_w, 0.2, height), (half - side_w / 2, BACK_WALL + 0.1, height / 2), material("back-r", WHITE, 0.95)),
        box("room-lintel", (door_w, 0.2, height - door_h), (0, BACK_WALL + 0.1, (height + door_h) / 2), material("lintel", WHITE, 0.95)),
        box("room-far", (half * 2, 0.1, height), (0, far + 0.05, height / 2), material("far", WHITE, 0.95)),
        box("room-partition", (2.6, 0.2, 3.0), (2.4, BACK_WALL + 3.3, 1.5), material("partition", WHITE, 0.95)),
        box("room-plinth", PLINTH, (0, 0, PLINTH[2] / 2), material("plinth", (0.2, 0.14, 0.1), 0.7)),
    ]
    black = material("track", (0.02, 0.02, 0.02), 0.5)
    for x in (-half + 1.4, half - 1.4):
        box("track", (0.04, depth - 8, 0.03), (x, mid + 4, height - 0.015), black)
    return baked


def paintings():
    half = ROOM[0]
    frame = material("frame", (0.02, 0.02, 0.02), 0.5)
    mount = material("mount", (0.9, 0.9, 0.88), 0.95)
    for slug, wall, where in PAINTINGS:
        image = bpy.data.images.load(str(WORKS / slug / "1.jpg"))
        w = PAINTING_H * image.size[0] / image.size[1]
        image.scale(int(640 * image.size[0] / max(image.size)), int(640 * image.size[1] / max(image.size)))
        image.pack()
        bpy.ops.mesh.primitive_plane_add(size=1)
        art = bpy.context.active_object
        art.name = f"art-{slug}"
        art.scale = (w, PAINTING_H, 1)
        art.data.materials.append(material(f"art-{slug}", (1, 1, 1), 0.8, image))
        outer = (w + 2 * MOUNT, PAINTING_H + 2 * MOUNT)
        board = box(f"mount-{slug}", (outer[0], 0.03, outer[1]), (0, 0, 0), mount)
        border = box(f"frame-{slug}", (outer[0] + 0.04, 0.025, outer[1] + 0.04), (0, 0, 0), frame)
        x, y = where
        if wall == "front":
            art.rotation_euler = (1.5708, 0, 0)
            art.location = (x, y - 0.042, HANG)
            board.location = (x, y - 0.025, HANG)
            border.location = (x, y - 0.0125, HANG)
            lamp_at = (x, y - 1.4, ROOM[1] - 0.05)
        else:
            side = -1 if wall == "left" else 1
            art.rotation_euler = (1.5708, 0, -side * 1.5708)
            art.location = (x - side * 0.042, y, HANG)
            for part, gap in ((board, 0.025), (border, 0.0125)):
                part.rotation_euler = (0, 0, 1.5708)
                part.location = (x - side * gap, y, HANG)
            lamp_at = (x - side * 1.4, y, ROOM[1] - 0.05)
        aim = (x, y, HANG)
        spot(lamp_at, aim, 320)
    spot((0, -1.0, ROOM[1] - 0.05), (0, 0, PLINTH[2] + 0.3), 300)


def spot(at, aim, watts):
    lamp = bpy.data.objects.new("lamp", bpy.data.lights.new("lamp", "SPOT"))
    lamp.data.energy = watts
    lamp.data.spot_size = 0.75
    lamp.data.spot_blend = 0.6
    lamp.data.shadow_soft_size = 0.05
    lamp.data.color = (1.0, 0.93, 0.84)
    look_at(lamp, at, aim)
    bpy.context.collection.objects.link(lamp)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.14, location=at)
    can = bpy.context.active_object
    can.name = "track-lamp"
    can.rotation_mode = "QUATERNION"
    can.rotation_quaternion = (Vector(aim) - Vector(at)).to_track_quat("Z", "Y")
    can.location = Vector(at) + (Vector(aim) - Vector(at)).normalized() * 0.08
    can.data.materials.append(bpy.data.materials["track"])
    can.visible_shadow = False


def light_room():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (1, 1, 1, 1)
    bg.inputs["Strength"].default_value = 0.08
    scene.world = world
    for y in (-7.0, -1.5, BACK_WALL + 3.5):
        fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "AREA"))
        fill.data.energy = 90
        fill.data.size = 3
        fill.data.color = (1.0, 0.97, 0.93)
        fill.location = (0, y, ROOM[1] - 0.06)
        bpy.context.collection.objects.link(fill)


def bake(objs):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = BAKE_SAMPLES
    scene.render.bake.use_pass_glossy = False
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        scene.cycles.device = "GPU"
    except (TypeError, KeyError):
        pass
    for obj in objs:
        bpy.ops.object.select_all(action="DESELECT")
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(island_margin=0.02)
        bpy.ops.object.mode_set(mode="OBJECT")
        size = {"room-floor": 2048, "room-lintel": 256, "room-plinth": 512}.get(obj.name, 1024)
        image = bpy.data.images.new(f"{obj.name}-light", size, size)
        mat = obj.data.materials[0]
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        mat.node_tree.nodes.active = tex
        bpy.ops.object.bake(type="COMBINED", margin=8)
        image.pack()
        image.file_format = "JPEG"
        bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        bsdf.inputs["Base Color"].default_value = (0, 0, 0, 1)
        bsdf.inputs["Roughness"].default_value = 1
        bsdf.inputs["Emission Strength"].default_value = 1
        mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
        print("baked", obj.name)


def camera_path():
    head = (0, 0, PLINTH[2] + BUST_HEIGHT * 0.55)
    left_wall = (-ROOM[0], -0.4, HANG)
    right_wall = (ROOM[0], -0.4, HANG)
    focus = {
        "focus-0": head,
        "focus-1": head,
        "focus-2": left_wall,
        "focus-3": head,
        "focus-4": right_wall,
        "focus-5": (0, BACK_WALL, HANG),
        "focus-works": head,
    }
    for name, co in focus.items():
        empty = bpy.data.objects.new(name, None)
        empty.location = co
        bpy.context.collection.objects.link(empty)

    cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    cam.data.lens = 28
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    wide_eye, wide_aim = (0, -8.5, 1.6), (0, 0, 1.35)
    shots = [
        (0, wide_eye, wide_aim),
        (50, (2.4, -3.6, 1.7), head),
        (100, (1.2, -2.6, 1.6), left_wall),
        (150, (-2.0, -2.8, 2.1), head),
        (200, (-1.4, -2.2, 1.6), right_wall),
        (250, (0.6, -5.0, 1.7), (0, BACK_WALL, HANG)),
        (300, (0.8, -7.5, 1.6), (0.3, 0, 1.35)),
        (350, (2.6, -7.5, 1.6), (2.2, 0, 1.35)),
    ]
    for frame, eye, target in shots:
        look_at(cam, eye, target)
        cam.keyframe_insert("location", frame=frame)
        cam.keyframe_insert("rotation_quaternion", frame=frame)
    cam.animation_data.action.name = "CameraAction"
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, 350
    scene.render.fps = 24


def export():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    for obj in [o for o in bpy.data.objects if o.type == "LIGHT"]:
        bpy.data.objects.remove(obj)
    bpy.ops.export_scene.gltf(
        filepath=str(OUT),
        export_format="GLB",
        export_cameras=True,
        export_animations=True,
        export_image_format="JPEG",
        export_jpeg_quality=80,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_apply=True,
    )
    print("exported", OUT, OUT.stat().st_size // 1024, "KB")


def preview(frames):
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = 960, 540
    scene.cycles.samples = 32
    for f in frames:
        scene.frame_set(f)
        scene.render.filepath = str(Path(sys.argv[-1]) / f"frame-{f:03d}.png")
        bpy.ops.render.render(write_still=True)


bpy.ops.wm.read_factory_settings(use_empty=True)
bust_on_plinth()
surfaces = room()
paintings()
light_room()
bake(surfaces)
camera_path()
if PREVIEW:
    preview([0, 50, 100, 150, 200, 250])
else:
    export()
