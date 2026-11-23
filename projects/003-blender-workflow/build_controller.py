"""Render an original three-key editing controller using Blender's Python.

Run all stages with:
  blender -b --factory-startup --python-exit-code 1 -P build_controller.py -- --stage all
"""

import argparse
import json
import math
import sys
import time
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


MM = 0.001
DECK_DEPTH_MM = 86
DIAL_RADIUS_MM = 25
DIAL_Y_MM = -4
DRAFT_DIAL_Y_MM = -26
STAGES = ("layout-draft", "layout", "edges", "materials", "final", "variant")
PALETTES = {
    "mint": {"dial": (0.13, 0.43, 0.31), "key": (0.44, 0.72, 0.58)},
    "copper": {"dial": (0.63, 0.19, 0.06), "key": (0.93, 0.42, 0.22)},
}


def material(name, color, roughness, metallic=0, coat=0):
    result = bpy.data.materials.new(name)
    result.diffuse_color = (*color, 1)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    for input_name, value in (
        ("Base Color", (*color, 1)), ("Roughness", roughness),
        ("Metallic", metallic), ("Coat Weight", coat),
    ):
        shader.inputs[input_name].default_value = value
    return result


def mesh_object(name, vertices, faces, position, surface, edge_mm):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([tuple(axis * MM for axis in v) for v in vertices], [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = tuple(axis * MM for axis in position)
    obj.data.materials.append(surface)
    if edge_mm:
        bevel = obj.modifiers.new("Edge bevel", "BEVEL")
        bevel.width = edge_mm * MM
        bevel.segments = 4
        bevel.limit_method = "ANGLE"
        bevel.harden_normals = True
        for face in mesh.polygons:
            face.use_smooth = True
        obj.modifiers.new("Face normals", "WEIGHTED_NORMAL").keep_sharp = True
    return obj


def prism(name, outline, height, position, surface, edge_mm=0):
    count = len(outline)
    bottom = [(x, y, -height / 2) for x, y in outline]
    top = [(x, y, height / 2) for x, y in outline]
    faces = [tuple(reversed(range(count))), tuple(range(count, count * 2))]
    for index in range(count):
        following = (index + 1) % count
        faces.append((index, following, following + count, index + count))
    return mesh_object(name, bottom + top, faces, position, surface, edge_mm)


def box(name, dimensions, position, surface, edge_mm=0):
    x, y, z = dimensions
    outline = [(-x / 2, -y / 2), (x / 2, -y / 2), (x / 2, y / 2), (-x / 2, y / 2)]
    return prism(name, outline, z, position, surface, edge_mm)


def disk(name, dimensions, position, surface, edge_mm=0):
    radius, height = dimensions
    outline = [(radius * math.cos(a), radius * math.sin(a))
               for a in (i * math.tau / 96 for i in range(96))]
    return prism(name, outline, height, position, surface, edge_mm)


def label(name, content, position, size_mm, surface):
    curve = bpy.data.curves.new(name, "FONT")
    curve.body = content
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.size = size_mm * MM
    curve.materials.append(surface)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = tuple(axis * MM for axis in position)


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def area_light(name, position, watts, width, color):
    light = bpy.data.lights.new(name, "AREA")
    light.shape = "DISK"
    light.size = width
    light.energy = watts
    light.color = color
    obj = bpy.data.objects.new(name, light)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = position
    aim(obj, (0, 0, 0.018))


def setup_studio(scene, polished):
    camera = bpy.data.objects.new("Product camera", bpy.data.cameras.new("Product camera"))
    scene.collection.objects.link(camera)
    camera.location = (0.132, -0.25, 0.238)
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 0.221
    aim(camera, (0, 0, 0.018))
    scene.camera = camera

    floor = material("Warm studio surface", (0.52, 0.49, 0.43), 0.83)
    box("Studio floor", (2000, 2000, 2), (0, 0, -1.1), floor)
    scene.world = bpy.data.worlds.new("Studio ambience")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.14
    if polished:
        area_light("Key", (-0.18, -0.20, 0.30), 9.0, 0.25, (1.0, 0.92, 0.80))
        area_light("Fill", (0.21, -0.11, 0.20), 2.0, 0.19, (0.76, 0.87, 1.0))
        area_light("Rim", (-0.015, 0.16, 0.23), 5.5, 0.18, (1.0, 0.98, 0.93))
    else:
        area_light("Preview light", (-0.20, -0.18, 0.32), 10.5, 0.26, (1.0, 1.0, 1.0))


def build_controller(stage, palette_name):
    palette = PALETTES[palette_name]
    colored = stage in ("materials", "final", "variant")
    rounded = stage in ("edges", "materials", "final", "variant")
    dial_y = DRAFT_DIAL_Y_MM if stage == "layout-draft" else DIAL_Y_MM
    clay = material("Neutral inspection clay", (0.47, 0.47, 0.47), 0.71)
    finishes = {
        "lower": material("Graphite powder coat", (0.022, 0.032, 0.040), 0.43, 0.2),
        "deck": material("Slate anodized top", (0.047, 0.062, 0.073), 0.39, 0.44),
        "dark": material("Black polymer", (0.011, 0.018, 0.021), 0.58),
        "ivory": material("Warm ceramic key", (0.76, 0.75, 0.66), 0.34, coat=0.1),
        "accent": material("Colored anodized dial", palette["dial"], 0.32, 0.60, 0.2),
        "center": material("Colored ceramic key", palette["key"], 0.35, coat=0.1),
        "ink": material("Charcoal ink", (0.010, 0.016, 0.017), 0.78),
        "white": material("Ivory ink", (0.80, 0.84, 0.76), 0.62),
        "signal": material("Power indicator", (0.20, 0.84, 0.46), 0.28),
    }

    def part(shape, name, size, position, finish, bevel=0):
        surface = finishes[finish] if colored else clay
        return shape(name, size, position, surface, bevel if rounded else 0)

    parts = [
        part(box, "lower_shell", (150, 90, 16), (0, 0, 10), "lower", 2.8),
        part(box, "shell_seam", (148, 88, 1.0), (0, 0, 18.0), "dark", 0.20),
        part(box, "top_deck", (147, DECK_DEPTH_MM, 3.4), (0, 0, 19.9), "deck", 1.15),
        part(disk, "dial_socket", (24, 2.2), (-43, dial_y, 22.0), "dark", 0.40),
        part(disk, "dial_body", (DIAL_RADIUS_MM, 12.4), (-43, dial_y, 28.5), "accent", 1.20),
        part(disk, "dial_face", (22.4, 0.9), (-43, dial_y, 35.05), "accent", 0.25),
        part(disk, "power_indicator", (1.45, 0.85), (63, 29, 21.67), "signal", 0.22),
    ]
    for x in (-57, 57):
        for y in (-29, 29):
            parts.append(part(disk, f"foot_{x}_{y}", (5.5, 2.6), (x, y, 1.3), "dark", 0.55))

    for index, (name, x, symbol) in enumerate((
        ("previous", 0, "PREV"), ("play_pause", 26, "PLAY"), ("next", 52, "NEXT"),
    )):
        parts.append(part(box, f"{name}_socket", (22.6, 25, 1.4), (x, -4, 21.9), "dark", 0.45))
        finish = "center" if index == 1 else "ivory"
        parts.append(part(box, f"{name}_key", (19.5, 22, 5.2), (x, -4, 24.5), finish, 1.05))
        if colored:
            label(f"{name}_legend", symbol, (x, -4, 27.12), 3.8, finishes["ink"])

    if colored:
        label("Jog legend", "J O G", (-43, dial_y, 35.52), 4.7, finishes["white"])
        label("Device mark", "C U T   /   0 3", (29, 28, 21.62), 5.1, finishes["white"])
        label("Dial deck legend", "F R A M E", (-43, -35, 21.62), 3.2, finishes["white"])

    for index in range(48):
        angle = index * math.tau / 48
        grip = part(box, f"dial_grip_{index:02}", (1.7, 1.05, 8.1),
                    (-43 + 24.65 * math.cos(angle), dial_y + 24.65 * math.sin(angle), 28.5),
                    "accent", 0.23)
        grip.rotation_euler.z = angle
        parts.append(grip)
    return parts, dial_y


def mesh_audit(objects):
    issues = {"boundary_edges": 0, "nonmanifold_edges": 0, "zero_area_faces": 0,
              "loose_vertices": 0, "nonpositive_volume_parts": 0}
    triangles = 0
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for obj in objects:
        geometry = bmesh.new()
        try:
            geometry.from_object(obj, depsgraph)
            triangles += len(geometry.calc_loop_triangles())
            issues["boundary_edges"] += sum(edge.is_boundary for edge in geometry.edges)
            issues["nonmanifold_edges"] += sum(
                not edge.is_manifold and not edge.is_boundary for edge in geometry.edges
            )
            issues["zero_area_faces"] += sum(face.calc_area() <= 1e-13 for face in geometry.faces)
            issues["loose_vertices"] += sum(not vertex.link_edges for vertex in geometry.verts)
            issues["nonpositive_volume_parts"] += geometry.calc_volume(signed=True) <= 0
        finally:
            geometry.free()
    return {"mesh_parts": len(objects), "triangles": triangles, **issues}, sum(issues.values())


def render_stage(stage, output, preview_width, final_width, threads):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    polished = stage in ("final", "variant")
    palette = "copper" if stage == "variant" else "mint"
    setup_studio(scene, polished)
    parts, dial_y = build_controller(stage, palette)
    mesh_report, defects = mesh_audit(parts)
    dial_front = min((obj.matrix_world @ Vector(corner)).y
                     for obj in parts if obj.name.startswith("dial_") for corner in obj.bound_box)
    front_clearance = round(DECK_DEPTH_MM / 2 + dial_front / MM, 2)
    report = {
        "blender": bpy.app.version_string, "stage": stage, "palette": palette,
        "mesh": mesh_report, "mesh_defects": defects,
        "layout": {"dial_y_mm": dial_y, "front_dial_clearance_mm": front_clearance,
                   "minimum_clearance_mm": 6, "passes": front_clearance >= 6},
    }
    if defects or (stage != "layout-draft" and not report["layout"]["passes"]):
        raise RuntimeError(json.dumps(report, ensure_ascii=False))

    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 36 if polished else 16
    scene.cycles.use_denoising = True
    scene.render.threads_mode = "FIXED"
    scene.render.threads = threads
    scene.render.resolution_x = final_width if polished else preview_width
    scene.render.resolution_y = scene.render.resolution_x * 3 // 4
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.65
    scene.render.filepath = str(output / f"{stage}.png")
    if stage == "final":
        scene.render.filepath = "//final.png"
        bpy.context.preferences.filepaths.save_version = 0
        bpy.ops.wm.save_as_mainfile(filepath=str(output / "cut-03.blend"))
    start = time.perf_counter()
    bpy.ops.render.render(write_still=True)
    report["render_seconds"] = round(time.perf_counter() - start, 2)
    (output / f"{stage}.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("REPORT " + json.dumps(report), flush=True)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("all", *STAGES), default="all")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent / "renders")
    parser.add_argument("--preview-width", type=int, default=720)
    parser.add_argument("--final-width", type=int, default=1200)
    parser.add_argument("--threads", type=int, default=8)
    arguments = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    if min(arguments.preview_width, arguments.final_width) < 64 or not 1 <= arguments.threads <= 64:
        parser.error("Use an image width of at least 64 and 1 to 64 render threads.")
    output = arguments.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    stages = STAGES if arguments.stage == "all" else (arguments.stage,)
    reports = [render_stage(stage, output, arguments.preview_width, arguments.final_width,
                            arguments.threads) for stage in stages]
    if arguments.stage == "all":
        (output / "report.json").write_text(json.dumps(reports, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
