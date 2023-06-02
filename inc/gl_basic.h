#include <SDL2/SDL_opengles2.h>

struct image
{
	int w, h;
	GLuint tex;
};

GLuint compile_shader(const char *vert_shader_file_path,
					  const char *fragment_shader_file_path);

struct image load_texture(char *file, struct image img);