#include "gl_basic.h"
#include <math.h>
#include <SDL2/SDL.h>
#include "cglm/cglm.h"

#define NK_INCLUDE_FIXED_TYPES
#define NK_INCLUDE_STANDARD_IO
#define NK_INCLUDE_STANDARD_VARARGS
#define NK_INCLUDE_DEFAULT_ALLOCATOR
#define NK_INCLUDE_VERTEX_BUFFER_OUTPUT
#define NK_INCLUDE_FONT_BAKING
#include "nuklear.h"
#include "nuklear_sdl_gles2.h"

#include <emscripten.h>

#include "gl_basic.h"

struct font
{
	struct nk_user_font *handle;
	nk_rune *ranges;
};

struct channel
{
	struct image img;
	unsigned char *data;
	struct
	{
		int top;
		int bot;
		int left;
		int right;
	} crop;

	float fov_deg;
	float fov;
	vec3 rotation;
};

struct global_context
{
    SDL_Window *win;
	struct nk_context *ctx;
	struct font std;
	struct font big;
	struct font icons;

	struct channel ch1;

	struct
	{
		GLuint shader;
		GLint pos;
		GLint coord;
		GLint aspect_w;
		GLint aspect_h;
		GLint crop;
	} crop_shader;
	struct
	{
		GLuint shader;
		GLint pos;
		GLint viewray;
		GLint crop;
		GLint scaler;
	} projection_shader;

	GLuint bgvbo;
	GLuint rayvbo;
	vec3 camera_rotation;
	mat4 camera_rotation_matrix;
	mat4 view_matrix;
	mat4 projection_matrix;
	float fov;
	float fovmin;
	float fovmax;
	bool projection;
	float interface_mult;
};

void MainLoop(void *loopArg);