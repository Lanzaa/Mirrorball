import ctx from './state.js';
import * as glm from 'gl-matrix';

const POINT_SIZE = 0.02;
const COLOR_TOPLEFT = glm.vec3.fromValues(1, 0, 1);
const COLOR_TOPRIGHT = glm.vec3.fromValues(1, 1, 0);
const COLOR_BOTLEFT = glm.vec3.fromValues(0, 1, 1);
const COLOR_BOTRIGHT = glm.vec3.fromValues(1, 1, 0);

function interp_border_pts(a, b, subdiv, aspect_ratio, color_a, color_b) {
	/* Ensure there is a point in the middle by making subdiv odd */
	if (subdiv % 2 == 1)
		subdiv++;
	const ray = glm.vec3.create();
	const uv_proj = glm.vec2.create();
	const color = glm.vec3.create();

	for (let x = 0; x < subdiv; ++x) {
		const mult = (1.0 / subdiv) * x;
		glm.vec3.lerp(ray, a, b, mult);
		glm.vec3.lerp(color, color_a, color_b, mult);
		glm.vec3.normalize(ray, ray);
		const divider = 2.0 * Math.SQRT2 * Math.sqrt(ray[2] + 1.0);
		glm.vec2.scale(
			uv_proj,
			glm.vec2.fromValues(ray[0], ray[1]),
			glm.glMatrix.toRadian(ctx.ch1.fov_deg)
		);
		glm.vec2.scale(uv_proj, uv_proj, 1 / divider);
		glm.vec2.scale(uv_proj, uv_proj, 2);
		glm.vec2.mul(uv_proj, uv_proj, aspect_ratio);

		ctx.gl.uniform2f(ctx.shaders.border.transform, uv_proj[0], uv_proj[1]);
		ctx.gl.uniform3f(ctx.shaders.border.color, color[0], color[1], color[2]);
		/* Draw small quad */
		ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
	}
}

export default function render_border(project_points, subdiv) {
	const aspect = ctx.canvas.width / ctx.canvas.height;

	ctx.gl.useProgram(ctx.shaders.border.handle);

	ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.shaders.border.quadvbo);
	ctx.gl.enableVertexAttribArray(ctx.shaders.border.vtx);

	const postcrop_w =
		ctx.ch1.w - (ctx.ch1.crop.left + ctx.ch1.crop.right);
	const postcrop_h =
		ctx.ch1.h - (ctx.ch1.crop.top + ctx.ch1.crop.bot);

	const aspect_ratio = glm.vec2.fromValues(1, 1);

	if (postcrop_h / postcrop_w > ctx.canvas.height / ctx.canvas.width)
		aspect_ratio[0] =
			(postcrop_w / postcrop_h) / (ctx.canvas.width / ctx.canvas.height);
	else
		aspect_ratio[1] =
			(postcrop_h / postcrop_w) / (ctx.canvas.height / ctx.canvas.width);

	ctx.gl.vertexAttribPointer(ctx.shaders.border.vtx, 2, ctx.gl.FLOAT, false,
		2 * Float32Array.BYTES_PER_ELEMENT, 0);
	if (project_points) {
		ctx.gl.uniform2f(ctx.shaders.border.scale,
			POINT_SIZE / aspect, POINT_SIZE);
		/* Each corner gets one viewray */
		const ray_topleft = glm.vec3.fromValues(
			ctx.cam.viewrays[2],
			ctx.cam.viewrays[3],
			ctx.cam.viewrays[4],
		);
		const ray_topright = glm.vec3.fromValues(
			ctx.cam.viewrays[7],
			ctx.cam.viewrays[8],
			ctx.cam.viewrays[9],
		);
		const ray_botright = glm.vec3.fromValues(
			ctx.cam.viewrays[12],
			ctx.cam.viewrays[13],
			ctx.cam.viewrays[14],
		);
		const ray_botleft = glm.vec3.fromValues(
			ctx.cam.viewrays[17],
			ctx.cam.viewrays[18],
			ctx.cam.viewrays[19],
		);

		/* TODO: Should use instanced rendering */
		/* Top */

		interp_border_pts(ray_topleft, ray_topright,
			subdiv * aspect, aspect_ratio,
			COLOR_TOPLEFT, COLOR_TOPRIGHT);
		/* Right */
		interp_border_pts(ray_topright, ray_botright, subdiv, aspect_ratio,
			COLOR_TOPRIGHT, COLOR_BOTRIGHT);
		/* Bottom */
		interp_border_pts(ray_botright, ray_botleft,
			subdiv * aspect, aspect_ratio,
			COLOR_BOTRIGHT, COLOR_BOTLEFT);
		/* Left */
		interp_border_pts(ray_botleft, ray_topleft, subdiv, aspect_ratio,
			COLOR_BOTLEFT, COLOR_TOPLEFT);
		/* Diagonal, Bottom-left -> Top-right */
		interp_border_pts(ray_botleft, ray_topright,
			subdiv * aspect * Math.SQRT2, aspect_ratio,
			COLOR_BOTLEFT, COLOR_TOPRIGHT);
		/* Diagonal, Top-left -> Bottom-right */
		interp_border_pts(ray_topleft, ray_botright,
			subdiv * aspect * Math.SQRT2, aspect_ratio,
			COLOR_TOPLEFT, COLOR_BOTRIGHT);

	} else {

	}
}